import json
import os
import re
from openai import AzureOpenAI
import time
from tqdm import tqdm

# Load the enhanced results
input_file = "/Users/l_y_o/Work/crazyface3/src/app/(main)/[generator-title]/enhanced_results_with_prompts.json"
output_file = "/Users/l_y_o/Work/happyface/pseo/refined_prompts.json"
checkpoint_file = "/Users/l_y_o/Work/happyface/pseo/refined_prompts_checkpoint.json"

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version="2023-05-15",
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"]
)

# System prompt for OpenAI to clean prompts
system_prompt_clean = """
You are an AI assistant specialized in cleaning up image prompts for text-to-image models.
Your task is to refine the given image prompt by:
1. Removing any prefixes like "Prompt:", "**Prompt:**", etc.
2. Removing any surrounding quotes (single, double, or triple quotes)
3. Removing asterisks (*) used for formatting
4. Keeping only the core descriptive content that should be sent to the image generation model
5. Ensuring the prompt is clear, concise, and effective for image generation
6. DO NOT change the actual content/meaning of the prompt - just clean up formatting

Return ONLY the cleaned prompt with no explanations or additional text.
"""

# System prompt for finding relevant titles
system_prompt_relevant = """
You are an AI assistant specialized in finding semantic similarities between titles.
Your task is to identify the 5 most relevant titles that are semantically similar to a target title.
Consider subject matter, themes, purpose, and tone when determining relevance.
Return only the indices of the 5 most relevant titles in a comma-separated list, like "2, 10, 15, 23, 45".
"""

def save_checkpoint(data, filename):
    """Save current progress to checkpoint file"""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Saved checkpoint to {filename}")

def clean_prompt(prompt, client):
    """Clean the prompt using Azure OpenAI API"""
    if not prompt:
        return ""
    
    # Create user prompt
    user_prompt = f"Clean up this image prompt to remove any formatting, prefixes, and quotes while preserving the actual content:\n\n{prompt}"
    
    # Call Azure OpenAI API
    response = client.chat.completions.create(
        model="gpt-4o",  # Use the appropriate model for your deployment
        messages=[
            {"role": "system", "content": system_prompt_clean},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=1000
    )
    
    # Extract the cleaned prompt from the response
    cleaned_prompt = response.choices[0].message.content
    return cleaned_prompt

def find_relevant_titles(target_title, all_titles, client):
    """Find the 5 most relevant titles to the target title using Azure OpenAI API"""
    
    # Create a formatted list of all titles with their indices
    formatted_titles = "\n".join([f"{i}: {title}" for i, title in enumerate(all_titles)])
    
    # Create user prompt
    user_prompt = f"""
Find the 5 most relevant titles to the following target title:

TARGET TITLE: {target_title}

LIST OF TITLES:
{formatted_titles}

Return only the indices of the 5 most relevant titles in a comma-separated list.
"""
    
    # Call Azure OpenAI API
    response = client.chat.completions.create(
        model="gpt-4o",  # Use the appropriate model for your deployment
        messages=[
            {"role": "system", "content": system_prompt_relevant},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=100
    )
    
    # Extract and process the response
    result = response.choices[0].message.content.strip()
    
    # Parse the indices from the response
    try:
        # Handle different formats of responses
        if "," in result:
            # For comma-separated format
            indices = [int(idx.strip()) for idx in result.split(",")]
        else:
            # For space-separated or other formats
            indices = [int(idx.strip()) for idx in re.findall(r'\d+', result)]
        
        # Get the corresponding titles
        relevant_titles = [all_titles[idx] for idx in indices if 0 <= idx < len(all_titles)]
        
        # If we couldn't get 5 titles, return what we have
        return relevant_titles[:5]
    except Exception as e:
        print(f"Error parsing relevant titles: {str(e)}")
        print(f"Response was: {result}")
        return []

def process_all_titles(enhanced_results, client):
    """Process all records to find relevant titles"""
    print("Finding relevant titles for each record...")
    
    # Extract all title_rewrites
    all_titles = [record.get("title_rewrite", "") for record in enhanced_results]
    
    # Process each record
    total_count = len(enhanced_results)
    for i, record in enumerate(tqdm(enhanced_results)):
        if "title_rewrite" in record and record["title_rewrite"]:
            try:
                # Find relevant titles
                target_title = record["title_rewrite"]
                
                # Create a temporary list without the current title
                temp_titles = all_titles.copy()
                temp_titles[i] = ""  # Remove the current title
                
                relevant_titles = find_relevant_titles(target_title, temp_titles, client)
                
                # Add the relevant titles to the record
                record["most_relevant_title_rewrites"] = relevant_titles
                
                # Print progress
                print(f"\nProcessed relevant titles for record {i+1}/{total_count}")
                print(f"Title: {target_title}")
                print(f"Relevant titles: {relevant_titles}")
                
                # Save checkpoint every 10 records
                if (i + 1) % 10 == 0:
                    save_checkpoint(enhanced_results, checkpoint_file)
                
            except Exception as e:
                print(f"Error finding relevant titles for record {i+1}: {str(e)}")
                # Save checkpoint in case of error
                save_checkpoint(enhanced_results, checkpoint_file)
            
            # Add a small delay to avoid rate limiting
            time.sleep(1)
        else:
            print(f"Skipping record {i+1}: No title_rewrite found")
    
    return enhanced_results

def main():
    # Load the data
    print(f"Loading data from {input_file}...")
    with open(input_file, 'r') as f:
        enhanced_results = json.load(f)
    
    # Initialize a counter for processed prompts
    processed_count = 0
    total_count = len(enhanced_results)
    
    # First process: Clean the prefill_prompts
    print(f"Processing {total_count} records for prompt cleaning...")
    for i, record in enumerate(tqdm(enhanced_results)):
        # Check if the record has a prefill_prompt
        if "prefill_prompt" in record and record["prefill_prompt"]:
            try:
                # Process the prompt
                original_prompt = record["prefill_prompt"]
                
                # First apply basic cleaning with regex
                # Remove "Prompt:" prefix and variations
                cleaned = re.sub(r'^(?:\*\*)?Prompt:(?:\*\*)?\s*\n*', '', original_prompt, flags=re.IGNORECASE)
                # Remove surrounding quotes
                cleaned = re.sub(r'^[\"\'\*]+|[\"\'\*]+$', '', cleaned.strip())
                
                # Now use Azure OpenAI for more thorough cleaning
                refined_prompt = clean_prompt(cleaned, client)
                
                # Update the record
                record["prefill_prompt"] = refined_prompt
                processed_count += 1
                
                # Print progress
                print(f"\nProcessed record {i+1}/{total_count}")
                print(f"Original: {original_prompt[:100]}...")
                print(f"Refined: {refined_prompt[:100]}...")
                
                # Save checkpoint every 10 records
                if (i + 1) % 10 == 0:
                    save_checkpoint(enhanced_results, checkpoint_file)
                
            except Exception as e:
                print(f"Error processing record {i+1}: {str(e)}")
                # Save checkpoint in case of error
                save_checkpoint(enhanced_results, checkpoint_file)
                
            # Add a small delay to avoid rate limiting
            time.sleep(1)
        else:
            print(f"Skipping record {i+1}: No prefill_prompt found")
    
    # Second process: Find relevant titles
    enhanced_results = process_all_titles(enhanced_results, client)
    
    # Save the final results
    with open(output_file, 'w') as f:
        json.dump(enhanced_results, f, indent=2)
    
    print(f"\nSuccessfully processed {processed_count} prompts and saved to {output_file}")

if __name__ == "__main__":
    main() 