import pandas as pd
import os
import re

def add_category_list_column(csv_file_path, category_file_path, output_file_path=None, exact_match=False):
    """
    Add a 'category list' column to a CSV file based on a category list file.
    
    Args:
        csv_file_path (str): Path to the input CSV file
        category_file_path (str): Path to the categorization file
        output_file_path (str, optional): Path for the output CSV. If None, overwrites input file.
        exact_match (bool): If True, only match whole words; if False, match substrings
    """
    # If no output file specified, overwrite the input file
    if output_file_path is None:
        output_file_path = csv_file_path
    
    # Read the CSV file
    print(f"Reading CSV file from: {csv_file_path}")
    df = pd.read_csv(csv_file_path)
    
    # Print CSV info for debugging
    print(f"CSV columns: {df.columns.tolist()}")
    print(f"CSV shape: {df.shape}")
    
    # Read the category list file with the specific format:
    # 1. CATEGORY1
    # 
    # item1
    # item2
    # ...
    #
    # 2. CATEGORY2
    # ...
    print(f"Reading category file from: {category_file_path}")
    categories = {}
    
    with open(category_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
        # Split the content by sections (each category section)
        # The regex pattern looks for numbered categories like "1. CATEGORY"
        sections = re.split(r'\n\s*\d+\.\s+', content)
        
        # The first section might be empty or contain header info - skip if empty
        if not sections[0].strip():
            sections = sections[1:]
        else:
            # If the first section isn't empty, it might have special format
            # In this case, check if it starts with a category pattern
            first_section = sections[0]
            match = re.match(r'^\s*\d+\.\s+(.+?)(\n|$)', first_section)
            if match:
                category = match.group(1).strip()
                sections[0] = first_section[match.end():]
                print(f"Found category in first section: '{category}'")
        
        for i, section in enumerate(sections, 1):
            if not section.strip():
                continue
                
            # Split the section into lines
            lines = section.strip().split('\n')
            
            # First line is the category name
            category = lines[0].strip()
            print(f"Found category {i}: '{category}'")
            
            # Items are lines after the blank line following the category name
            items = []
            collecting_items = False
            
            for line in lines[1:]:
                line = line.strip()
                
                if not line and not collecting_items:
                    # First blank line after category name - start collecting items
                    collecting_items = True
                    continue
                elif not line and collecting_items:
                    # Another blank line after we started collecting items - we're done with this category
                    break
                
                if collecting_items and line:
                    items.append(line)
            
            print(f"  Found {len(items)} items for category '{category}'")
            
            # Store items with their category
            for item in items:
                if item:  # Skip empty items
                    categories[item.lower()] = category
    
    print(f"Loaded {len(categories)} unique category items")
    if len(categories) > 0:
        print(f"Sample categories: {list(categories.items())[:5]}")
    else:
        print("WARNING: No categories were parsed from the file!")
        return
    
    # Create patterns for matching
    if exact_match:
        # Use word boundaries for exact word matching
        category_patterns = {r'\b' + re.escape(item.lower()) + r'\b': category 
                            for item, category in categories.items()}
        print("Using exact word matching for categories")
    else:
        # Use simple string contains for substring matching (can produce more matches)
        category_patterns = {re.escape(item.lower()): category 
                            for item, category in categories.items()}
        print("Using substring matching for categories")
    
    # Determine which columns to use for categorization
    text_columns = df.select_dtypes(include=['object']).columns.tolist()
    
    if not text_columns:
        print("WARNING: No text columns found in the CSV")
        return
    
    print(f"Will search for categories in columns: {text_columns}")
    
    # Apply categorization to each row
    df['category list'] = ""
    
    for idx, row in df.iterrows():
        row_categories = set()
        
        for column in text_columns:
            if column in row and not pd.isna(row[column]):
                text = str(row[column]).lower()
                
                for pattern, category in category_patterns.items():
                    if exact_match:
                        if re.search(pattern, text):
                            row_categories.add(category)
                    else:
                        # Substring matching
                        if re.escape(pattern).replace('\\\\', '\\') in text:
                            row_categories.add(category)
        
        df.at[idx, 'category list'] = ", ".join(sorted(row_categories))
        
        # Progress indication for large files
        if idx % 1000 == 0:
            print(f"Processed {idx} rows...")
    
    # Check if any categories were assigned
    categories_found = df['category list'].str.strip().str.len() > 0
    print(f"Rows with categories: {sum(categories_found)} out of {len(df)}")
    
    if sum(categories_found) == 0:
        print("WARNING: No categories were assigned to any row!")
        print("Trying again with substring matching...")
        if exact_match:
            # Try again with substring matching
            return add_category_list_column(csv_file_path, category_file_path, output_file_path, False)
    
    # Save the updated dataframe
    print(f"Saving updated CSV to: {output_file_path}")
    df.to_csv(output_file_path, index=False)
    print("Done!")

if __name__ == "__main__":
    # Define file paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file = os.path.join(current_dir, "nsfw_data_simplified.csv")
    category_file = os.path.join(current_dir, "categorization.txt")
    output_file = os.path.join(current_dir, "nsfw_data_with_categories.csv")
    
    # First try with exact word matching
    add_category_list_column(csv_file, category_file, output_file, exact_match=True)
    
    # Print confirmation that can be checked
    print("\nCheck the following information:")
    print("1. Does the category file format look like 'Category: item1, item2, item3'?")
    print("2. Are there columns with text data in your CSV?")
    print("3. Do any terms in your category file appear in your CSV data?")
