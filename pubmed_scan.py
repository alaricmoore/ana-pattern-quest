#!/usr/bin/env python3
"""
pubmed_scan.py — find recent research for each ANA pattern and write research.json

WHAT THIS DOES (plain English)
------------------------------
For every ICAP pattern, this script asks PubMed "what's been published lately about
this pattern's antigen?" and saves the answers to public/research.json. The game
loads that file and shows a "Recent research" list under each pattern in Learn Mode.

HOW IT TALKS TO PUBMED (the web-API part)
-----------------------------------------
PubMed has a free public API called E-utilities. We use two endpoints:

  1. esearch  — give it a search term, it returns a list of matching PMIDs (just IDs).
  2. esummary — give it PMIDs, it returns the title, journal, and date for each.

We talk to them with plain HTTP GET requests — the same thing your browser does when
you type a URL. The search words go in the URL after "?" as "query parameters"
(term=..., retmax=...). The reply comes back as JSON (a text format of nested
dicts/lists), which Python parses into normal dictionaries.

No login, no API key, and no bearer token are required for light use. PubMed just
asks that you stay under ~3 requests/second (we sleep between calls). If you ever
want to go faster, get a free NCBI API key and set it as an environment variable:

    export NCBI_API_KEY=your_key_here

USAGE
-----
    python3 pubmed_scan.py                 # papers from the last 18 months, 5 per pattern
    python3 pubmed_scan.py --since 2024    # only papers published in/after 2024
    python3 pubmed_scan.py --max 8         # up to 8 papers per pattern
    python3 pubmed_scan.py --out public/research.json

Re-run it whenever you want a fresh sweep. It overwrites research.json each time.
"""

import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import date, timedelta

EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

# A shared clause AND-ed onto every search so we stay on autoimmunity papers and
# don't drift into unrelated molecular-biology hits. Tweak to taste.
CONTEXT = "(autoantibodies OR antinuclear OR HEp-2 OR immunofluorescence)"

# One search query per pattern, keyed by ICAP code. Built around each pattern's
# antigen(s). AC-0 (negative) has no antigen, so it is intentionally omitted.
SEARCH_TERMS = {
    "AC-1":  '("anti-dsDNA" OR "anti-nucleosome" OR "anti-chromatin")',
    "AC-2":  '("DFS70" OR "LEDGF")',
    "AC-3":  '("anti-centromere" OR "CENP-B antibody")',
    "AC-4":  '("anti-SSA" OR "anti-Ro60" OR "anti-La/SSB")',
    "AC-5":  '("anti-U1-RNP" OR "anti-Sm antibody")',
    "AC-6":  '("anti-Sp100" OR "anti-PML antibody" OR "multiple nuclear dots")',
    "AC-7":  '("anti-p80 coilin" OR "anti-coilin")',
    "AC-8":  '("anti-PM/Scl" OR "anti-PM-Scl")',
    "AC-9":  '("anti-fibrillarin" OR "anti-U3-RNP")',
    "AC-10": '("anti-RNA polymerase I" OR "anti-NOR-90")',
    "AC-11": '("anti-lamin antibody" OR "anti-lamin B receptor")',
    "AC-12": '("anti-gp210" OR "anti-nuclear pore")',
    "AC-13": '("anti-PCNA antibody")',
    "AC-14": '("anti-CENP-F" OR "anti-mitosin")',
    "AC-15": '("anti-actin antibody" OR "anti-smooth muscle antibody")',
    "AC-16": '("anti-vimentin antibody" OR "anti-cytokeratin antibody")',
    "AC-17": '("anti-alpha-actinin" OR "anti-vinculin")',
    "AC-18": '("anti-GW182" OR "anti-Ge-1" OR "GW body autoantibody")',
    "AC-19": '("anti-ribosomal P" OR "anti-PL-7" OR "anti-PL-12")',
    "AC-20": '("anti-Jo-1" OR "antisynthetase antibody")',
    "AC-21": '("anti-mitochondrial antibody" OR "anti-PDC-E2")',
    "AC-22": '("anti-Golgi antibody" OR "anti-golgin")',
    "AC-23": '("anti-rods and rings" OR "anti-IMPDH2")',
    "AC-24": '("anti-centrosome" OR "anti-pericentrin")',
    "AC-25": '("anti-mitotic spindle" OR "anti-HsEg5")',
    "AC-26": '("anti-NuMA")',
    "AC-27": '("anti-midbody" OR "intercellular bridge autoantibody")',
    "AC-28": '("mitotic chromosomal autoantibody" OR "anti-MCA")',
    "AC-29": '("anti-topoisomerase I" OR "anti-Scl-70")',
    "AC-30": '("dense fine speckled" OR "AC-30 pattern")',
    "AC-31": '("myriad discrete speckled" OR "AC-4a pattern")',
}


def http_get_json(url):
    """Do one HTTP GET and parse the JSON reply into Python objects."""
    req = urllib.request.Request(url, headers={"User-Agent": "ana-pattern-quest/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def add_key(params):
    """Attach the NCBI API key from the environment, if one is set."""
    key = os.environ.get("NCBI_API_KEY")
    if key:
        params["api_key"] = key
    return params


def esearch(term, retmax, mindate, maxdate):
    """Step 1: search PubMed, return a list of PMIDs (newest first)."""
    params = add_key({
        "db": "pubmed",
        "term": f"{term} AND {CONTEXT}",
        "retmax": str(retmax),
        "sort": "pub_date",
        "datetype": "pdat",          # filter by publication date
        "mindate": mindate,
        "maxdate": maxdate,
        "retmode": "json",
    })
    url = f"{EUTILS}/esearch.fcgi?{urllib.parse.urlencode(params)}"
    data = http_get_json(url)
    return data.get("esearchresult", {}).get("idlist", [])


def esummary(pmids):
    """Step 2: fetch title/journal/year for a list of PMIDs."""
    if not pmids:
        return []
    params = add_key({"db": "pubmed", "id": ",".join(pmids), "retmode": "json"})
    url = f"{EUTILS}/esummary.fcgi?{urllib.parse.urlencode(params)}"
    data = http_get_json(url)
    result = data.get("result", {})
    papers = []
    for pmid in result.get("uids", []):
        item = result.get(pmid, {})
        pubdate = item.get("pubdate", "")            # e.g. "2025 Mar" or "2024"
        year = pubdate.split(" ")[0] if pubdate else ""
        papers.append({
            "pmid": pmid,
            "title": item.get("title", "").rstrip("."),
            "year": year,
            "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
        })
    return papers


def main():
    parser = argparse.ArgumentParser(description="Scan PubMed for recent ANA-pattern research.")
    parser.add_argument("--since", default=None,
                        help="Earliest publication date (YYYY or YYYY/MM/DD). Default: 18 months ago.")
    parser.add_argument("--max", type=int, default=5, dest="max_results",
                        help="Max papers per pattern (default 5).")
    parser.add_argument("--out", default="public/research.json",
                        help="Where to write the JSON (default public/research.json).")
    parser.add_argument("--sleep", type=float, default=0.4,
                        help="Seconds to wait between requests (default 0.4 ~= polite 2-3/sec).")
    args = parser.parse_args()

    today = date.today()
    if args.since:
        mindate = args.since
    else:
        mindate = (today - timedelta(days=548)).strftime("%Y/%m/%d")  # ~18 months
    maxdate = today.strftime("%Y/%m/%d")

    print(f"Scanning PubMed for papers {mindate} .. {maxdate} "
          f"(up to {args.max_results} per pattern)\n")

    research = {}
    total = 0
    for ac_id, term in SEARCH_TERMS.items():
        try:
            pmids = esearch(term, args.max_results, mindate, maxdate)
            time.sleep(args.sleep)
            papers = esummary(pmids)
            time.sleep(args.sleep)
        except Exception as exc:                       # network hiccup: skip, keep going
            print(f"  {ac_id}: ERROR ({exc}) — skipped", file=sys.stderr)
            continue
        if papers:
            research[ac_id] = papers
            total += len(papers)
        print(f"  {ac_id}: {len(papers)} paper(s)")

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(research, fh, indent=2, ensure_ascii=False)

    print(f"\nWrote {total} papers across {len(research)} patterns to {args.out}")


if __name__ == "__main__":
    main()
