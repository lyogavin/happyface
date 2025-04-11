import json
import csv
import os

def simplify_nsfw_data(input_file, output_file):
    """
    Extract specific fields from nsfw_tools_crawled_data.json and save to a CSV file.
    
    Args:
        input_file (str): Path to the input JSON file
        output_file (str): Path to the output CSV file
    """
    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(output_file)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Read the JSON data
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError:
        print(f"Error: {input_file} is not a valid JSON file")
        return
    except FileNotFoundError:
        print(f"Error: {input_file} not found")
        return
    
    # Open CSV file for writing
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['original_description', 'tool_link', 'original_title', 'title', 'description', 'ogDescription']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        # Write header
        writer.writeheader()
        
        # Process each record
        records_processed = 0
        for item in data:
            row = {}
            
            # Extract 'lfcontact' from 'original_data'
            if 'original_data' in item and 'description' in item['original_data']:
                row['original_description'] = item['original_data']['description']
                row['tool_link'] = item['original_data']['tool_link']
                row['original_title'] = item['original_data']['title']
            else:
                row['original_description'] = ''
                row['tool_link'] = ''
                row['original_title'] = ''
            # Extract 'title', 'description', and 'ogDescription' from 'scrape_data' -> 'metadata'
            if 'scrape_data' in item and 'metadata' in item['scrape_data']:
                metadata = item['scrape_data']['metadata']
                row['title'] = metadata.get('title', '')
                row['description'] = metadata.get('description', '')
                row['ogDescription'] = metadata.get('ogDescription', '')
            else:
                row['title'] = ''
                row['description'] = ''
                row['ogDescription'] = ''
            
            # Write the row
            writer.writerow(row)
            records_processed += 1
        
        print(f"Successfully processed {records_processed} records and saved to {output_file}")

if __name__ == "__main__":
    input_file = "nsfw_tools_crawled_data.json"
    output_file = "nsfw_data_simplified.csv"
    
    simplify_nsfw_data(input_file, output_file)
