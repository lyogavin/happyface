import csv
import json
import os
import time
from typing import Dict, List, Any
import pandas as pd
from firecrawl import FirecrawlApp

# Initialize Firecrawl with API key
API_KEY = ""
app = FirecrawlApp(api_key=API_KEY)

# File paths
INPUT_CSV = "AINSFWTools_tools.csv"
OUTPUT_JSON = "nsfw_tools_crawled_data.json"
PROGRESS_FILE = "crawl_progress.json"

def load_csv_data(csv_file: str) -> List[Dict[str, Any]]:
    """Load data from CSV file into a list of dictionaries."""
    try:
        # Check if file exists first
        if not os.path.exists(csv_file):
            print(f"CSV file '{csv_file}' not found in the current directory.")
            print(f"Current working directory: {os.getcwd()}")
            return []
        
        # Check if file is empty
        if os.path.getsize(csv_file) == 0:
            print(f"CSV file '{csv_file}' exists but is empty (0 bytes).")
            return []
        
        # Try to load the CSV
        df = pd.read_csv(csv_file)
        
        # Debug info about the CSV
        print(f"CSV loaded successfully. Shape: {df.shape}, Columns: {df.columns.tolist()}")
        
        # Check for required columns
        if "标题链接" not in df.columns and "tool_link" not in df.columns:
            print(f"Warning: Neither '标题链接' nor 'tool_link' column found in CSV. Available columns: {df.columns.tolist()}")
        
        # Return data as list of dicts
        data = df.to_dict('records')
        return data
    except Exception as e:
        print(f"Error loading CSV file: {e}")
        return []

def load_progress() -> Dict[str, Any]:
    """Load progress from progress file if it exists."""
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading progress file: {e}")
    return {'completed_urls': [], 'results': []}

def save_progress(progress: Dict[str, Any]):
    """Save current progress to file."""
    try:
        with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
            json.dump(progress, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving progress: {e}")

def save_results(results: List[Dict[str, Any]]):
    """Save final results to JSON file."""
    try:
        with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"Results saved to {OUTPUT_JSON}")
    except Exception as e:
        print(f"Error saving results: {e}")

def load_results() -> List[Dict[str, Any]]:
    """Load results from the output JSON file if it exists."""
    if os.path.exists(OUTPUT_JSON):
        try:
            with open(OUTPUT_JSON, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading results file: {e}")
    return []

def scrape_url(url: str) -> Dict[str, Any]:
    """Scrape a URL using Firecrawl and return the result."""
    try:
        print(f"Scraping URL: {url}")
        # Using the updated API format
        result = app.scrape_url(
            url,
            params={'formats': ['markdown', 'html']}
        )
        
        # Handle empty result cases
        if not result:
            print(f"Empty result received for URL: {url}")
            return {"error": "Empty result returned from API", "is_empty": True}
            
        return result
    except Exception as e:
        print(f"Error scraping URL {url}: {e}")
        return {"error": str(e), "is_empty": False}

def check_and_retry_errors():
    """Check the output JSON for errors and retry those URLs."""
    # First, explicitly check if the file exists
    if not os.path.exists(OUTPUT_JSON):
        print(f"Results file '{OUTPUT_JSON}' not found. Creating an empty one.")
        save_results([])  # Create an empty results file
        return
    
    # Check if the file is empty (zero bytes)
    if os.path.getsize(OUTPUT_JSON) == 0:
        print(f"Results file '{OUTPUT_JSON}' exists but is empty (0 bytes). Initializing with empty array.")
        save_results([])  # Initialize with empty array
        return
        
    # Try to load the results
    results = load_results()
    if not results:
        # File exists, not empty, but couldn't parse JSON or has invalid structure
        print(f"Results file '{OUTPUT_JSON}' exists but contains invalid JSON. Backing up and creating new file.")
        # Create a backup of the problematic file
        backup_file = f"{OUTPUT_JSON}.bak"
        try:
            os.rename(OUTPUT_JSON, backup_file)
            print(f"Backed up problematic file to {backup_file}")
            # Create new empty file
            save_results([])
        except Exception as e:
            print(f"Error backing up file: {e}")
        return
    
    retry_count = 0
    updated_count = 0
    
    for i, item in enumerate(results):
        # Check if the item has a scrape error or empty content
        needs_recrawl = False
        
        if "scrape_data" in item:
            # Case 1: scrape_data contains only an error
            if "error" in item["scrape_data"] and len(item["scrape_data"]) == 1:
                needs_recrawl = True
            
            # Case 2: scrape_data is an empty dict
            elif not item["scrape_data"]:
                needs_recrawl = True
            
            # Case 3: scrape_data has no useful content
            elif not any(key for key in item["scrape_data"] if key != "error"):
                needs_recrawl = True
        else:
            # Case 4: scrape_data doesn't exist
            needs_recrawl = True
        
        if needs_recrawl:
            url = item["original_data"].get("tool_link", "")
            if not url:
                continue
                
            print(f"Found URL needing recrawl: {url}. Retrying...")
            retry_count += 1
            
            # Make sure URL starts with http:// or https://
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            # Retry scraping
            new_result = scrape_url(url)
            
            # Only update if the new scrape was successful
            if "error" not in new_result and new_result:
                item["scrape_data"] = new_result
                updated_count += 1
                print(f"Successfully rescraped URL: {url}")
            else:
                print(f"Failed to rescrape URL: {url} - {new_result.get('error', 'Empty result')}")
            
            # Small delay to avoid rate limiting
            time.sleep(2)
    
    if retry_count > 0:
        # Save the updated results
        save_results(results)
        print(f"Retry complete. Attempted: {retry_count}, Successfully updated: {updated_count}")
    else:
        print("No URLs needing recrawling found in the result file.")

def main():
    # Load CSV data
    print(f"Attempting to load CSV file: {INPUT_CSV}")
    tools_data = load_csv_data(INPUT_CSV)
    if not tools_data:
        print(f"No data found in CSV file '{INPUT_CSV}'. Make sure the file exists and contains valid data.")
        return
    
    print(f"Successfully loaded CSV with {len(tools_data)} tools.")
    
    # Print sample of the data to debug column names
    if tools_data:
        print("Sample of first tool data:")
        for key, value in tools_data[0].items():
            # Truncate long values for display
            if isinstance(value, str) and len(value) > 100:
                value = value[:100] + "..."
            print(f"  {key}: {value}")
    
    # Check which column contains URLs
    url_column = None
    if tools_data and "标题链接" in tools_data[0]:
        url_column = "标题链接"
    elif tools_data and "tool_link" in tools_data[0]:
        url_column = "tool_link"
    else:
        print("Could not find URL column in the CSV. Please check the CSV file structure.")
        # Try to detect a column that might contain URLs
        for key in tools_data[0].keys():
            sample_value = str(tools_data[0].get(key, ""))
            if "http" in sample_value.lower() or "www." in sample_value.lower():
                print(f"Column '{key}' might contain URLs. Sample: {sample_value}")
                url_column = key
                break
        
        if not url_column:
            print("No column containing URLs could be detected. Please check your CSV file structure.")
            return
            
    print(f"Using '{url_column}' as the URL column")
    
    # Load existing results if available
    existing_results = load_results()
    
    # Create a set of already processed URLs from existing results
    processed_urls = set()
    if existing_results:
        for item in existing_results:
            if "original_data" in item and url_column in item["original_data"]:
                processed_urls.add(item["original_data"][url_column])
    
    print(f"Found {len(tools_data)} tools in CSV. {len(processed_urls)} already processed.")
    
    # If all URLs are already processed, inform the user
    remaining_urls = len(tools_data) - len(processed_urls)
    if remaining_urls <= 0:
        print("All URLs in the CSV have already been processed. If you want to recrawl, delete or rename the output file.")
        return  # Added return to exit early
        
    # Create or update results list
    results = existing_results if existing_results else []
    
    # If no results exist yet, create an empty results file
    if not os.path.exists(OUTPUT_JSON):
        save_results(results)
        print(f"Created empty results file at {OUTPUT_JSON}")
    
    # Debug: Print the first few URLs to be processed
    urls_to_process = []
    for tool in tools_data:
        url = tool.get(url_column, "")
        if url and url not in processed_urls:
            urls_to_process.append(url)
            if len(urls_to_process) >= 5:  # Show at most 5 examples
                break
    
    if urls_to_process:
        print(f"Will process these URLs (showing first {len(urls_to_process)} examples):")
        for i, url in enumerate(urls_to_process):
            print(f"  {i+1}. {url}")
    else:
        print("No new URLs to process")
        return  # Added return to exit early if no URLs to process
    
    # Process counter
    processed_count = 0
    
    # Process each tool
    for i, tool in enumerate(tools_data):
        # Skip if already processed
        url = tool.get(url_column, "")
        if not url or url in processed_urls:
            continue
        
        try:
            # Make sure URL starts with http:// or https://
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
                
            print(f"Starting to scrape URL: {url}")
            # Scrape the URL
            scrape_result = scrape_url(url)
            
            # Check if scrape was successful
            if "error" in scrape_result:
                print(f"Error detected in scrape result: {scrape_result['error']}")
            
            # Combine original data with scraped data
            combined_data = {
                "original_data": tool,
                "scrape_data": scrape_result
            }
            
            # Add to results
            results.append(combined_data)
            processed_urls.add(url)  # Add to processed URLs
            processed_count += 1
            
            # Save results after each successful scrape
            save_results(results)
            
            print(f"Processed {i+1}/{len(tools_data)}: {url}")
            
            # Add a small delay to avoid rate limiting
            time.sleep(2)
            
        except Exception as e:
            print(f"Error processing tool {i+1}/{len(tools_data)}: {e}")
            # Continue with the next tool
    
    if processed_count > 0:
        print(f"Scraping completed! Successfully processed {processed_count} URLs.")
    else:
        print("No URLs were processed. Please check your CSV file and make sure there are new URLs to scrape.")
            
    # Check for errors and retry
    print("Checking for errors in the results file...")
    check_and_retry_errors()

if __name__ == "__main__":
    main()
