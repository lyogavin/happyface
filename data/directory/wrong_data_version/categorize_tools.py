import os
import requests
import time
import json
from retry import retry
from openai import AzureOpenAI
import csv
import pandas as pd
from tqdm import tqdm
import concurrent.futures
import argparse

# Initialize OpenAI client
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY") or ""

client = AzureOpenAI(
    api_key=OPENAI_API_KEY,
    api_version="2025-01-01-preview",
    azure_endpoint="https://animaaiopenai.openai.azure.com/"
)

# Define the NSFW categories
NSFW_CATEGORIES = """
Main NSFW AI Task Categories
1. AI Nudifier/DeepNude Tools
   * AI clothing removal/undressing services
   * DeepNude image generators (with and without blur)
   * Nude image creation from regular photos
2. NSFW Chatbots/Virtual Companions
   * AI girlfriends/boyfriends
   * NSFW character chatbots
   * Erotic roleplay companions
   * Interactive sexting partners
3. NSFW Image Generators
   * Unrestricted AI image creation
   * Porn/erotic image generators
   * Custom NSFW image creation
4. NSFW Video Generators
   * AI porn video creation
   * Adult content video generation
   * NSFW short video makers
5. Face Swap/DeepFake Tools
   * Celebrity deepfakes
   * Face swapping for NSFW content
   * Personalized deepfake creation
6. NSFW Story Generators
   * Erotic fiction writers
   * NSFW fanfic creators
   * Adult story generators
7. AI Voice/Audio NSFW Tools
   * NSFW voice messages
   * Erotic voice generation
   * Audio companion features
8. NSFW Animation Creators
   * NSFW GIF generators
   * Adult animation tools
   * Animated NSFW content
9. NSFW Art Generators
   * Erotic art creation
   * NSFW artistic renderings
   * Adult-themed artwork
10. Style Transfer/NSFW Effects
   * Special NSFW effects application
   * Fetish visual effects (bukkake, shibari, etc.)
   * Transformation effects
11. NSFW Avatar Creators
   * Custom NSFW character creation
   * Personalized adult avatars
Specialized NSFW Categories
12. Anime/Hentai Generators
   * Hentai image creation
   * Anime-style NSFW content
   * Cartoon adult content
13. Interactive Roleplay Platforms
   * NSFW scenario generators
   * Sexual roleplay environments
   * Fantasy interaction systems
14. NSFW Content Platforms/Communities
   * Multi-feature NSFW suites
   * Adult content creation marketplaces
   * NSFW content sharing communities
15. Telegram NSFW Bots
   * Telegram-based adult services
   * NSFW messaging bots
   * Platform-specific adult content creation
16. NSFW Photo Enhancement
   * Adult image improvement
   * NSFW content upscaling
   * Photo quality enhancement for adult content
17. Uncensored/No Filter Content Creators
   * Restriction-free generation tools
   * Censorship bypass services
   * Unfiltered content creation
18. Adult Games
   * Interactive NSFW games
   * Adult gaming platforms
   * Sexual gameplay experiences
Niche NSFW Categories
19. Gay/LGBT Content Generators
   * Specialized NSFW content for LGBT audiences
   * Gay AI boyfriends/partners
20. Furry Content Creators
   * Anthropomorphic NSFW content
   * Furry character generators
21. Celebrity-Focused Tools
   * Famous person deepfakes
   * Celebrity NSFW content creation
22. Fetish-Specific Generators
   * BDSM content creators
   * Specialized fetish content (futanari, shibari, etc.)
   * Niche sexual interest generators
23. Femdom AI Tools
   * Female domination chatbots
   * Femdom content creators
24. Body Part Specific Generators
   * Specialized generators for specific body parts
   * Targeted NSFW content creation
25. Multi-Purpose NSFW Suites
   * All-in-one adult content creation tools
   * Platforms offering multiple NSFW services
"""

@retry(tries=3, delay=2, backoff=2, jitter=(1, 3), logger=None)
def categorize_nsfw_tool(tool_name, tool_description):
    """
    Categorize an NSFW tool using GPT-4o
    
    Args:
        tool_name: Name of the NSFW tool
        tool_description: Description of the NSFW tool's functionality
        
    Returns:
        Dictionary containing categorization results
    """
    try:
        system_prompt = f"""You are an AI safety researcher categorizing NSFW AI tools.
Given information about an AI tool, tag it with all applicable NSFW categories from the list below.
A tool may belong to multiple categories if it serves multiple functions.

{NSFW_CATEGORIES}

Respond in JSON format with these fields:
- category_tags: Array of category numbers (1-25) that apply to this tool
- primary_category: The single most relevant category number
- confidence: Your confidence in this categorization (high, medium, low)
- reasoning: Brief explanation for your categorization choices"""

        user_prompt = f"Tool Name: {tool_name}\nTool Description: {tool_description}\n\nPlease categorize this tool based on the information provided."
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=1000
        )
        
        # Extract and parse the JSON response
        categorization = response.choices[0].message.content
        return json.loads(categorization)
    
    except Exception as e:
        print(f"Error categorizing '{tool_name}': {e}")
        return {
            "category_tags": [],
            "primary_category": None,
            "confidence": "low",
            "reasoning": f"Error during categorization: {str(e)}"
        }

@retry(tries=3, delay=2, backoff=2, jitter=(1, 3), logger=None)
def batch_categorize_nsfw_tools(tools_list):
    """
    Categorize multiple NSFW tools in a single API call
    
    Args:
        tools_list: List of dictionaries containing 'name' and 'description' of tools
        
    Returns:
        List of categorization results
    """
    try:
        # Format the tools list into a structured string
        formatted_tools = "\n\n".join([f"Tool {i+1}:\nName: {tool.get('name', 'Unknown')}\nDescription: {tool.get('description', '')}" 
                                      for i, tool in enumerate(tools_list)])
        
        system_prompt = f"""You are an AI safety researcher categorizing NSFW AI tools.
I will provide you with information about multiple tools. For EACH tool, tag it with all applicable NSFW categories from the list below.
A tool may belong to multiple categories if it serves multiple functions.

{NSFW_CATEGORIES}

For EACH tool, respond in JSON format with:
- tool_number: The number of the tool
- category_tags: Array of category numbers (1-25) that apply to this tool
- primary_category: The single most relevant category number
- confidence: Your confidence in this categorization (high, medium, low)
- reasoning: Brief explanation for your categorization choices

Format your entire response as a valid JSON array where each element represents one tool."""

        user_prompt = f"Here are the tools to categorize:\n\n{formatted_tools}\n\nPlease categorize each tool based on the information provided."
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=4000
        )
        
        # Extract and parse the JSON response
        categorization_results = response.choices[0].message.content
        
        # Properly parse the JSON response
        try:
            # First try to parse as a JSON array
            parsed_results = json.loads(categorization_results)
            # Check if it's a list (array)
            if isinstance(parsed_results, list):
                return parsed_results
            # If it's an object with a key that might contain results
            elif isinstance(parsed_results, dict) and any(k for k in parsed_results.keys() if 'result' in k.lower() or 'tool' in k.lower()):
                for key in parsed_results.keys():
                    if isinstance(parsed_results[key], list):
                        return parsed_results[key]
                # If we can't find a list, return as is
                return [parsed_results]
            else:
                # Return the entire object wrapped in a list
                return [parsed_results]
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {e}")
            print(f"Raw response: {categorization_results}")
            # Return empty results
            return [{"tool_number": i+1, 
                    "category_tags": [], 
                    "primary_category": None,
                    "confidence": "low",
                    "reasoning": f"Error parsing JSON response: {str(e)}"}
                    for i in range(len(tools_list))]
    
    except Exception as e:
        print(f"Error in batch categorization: {e}")
        # Return empty results for each tool
        return [{"tool_number": i+1, 
                 "category_tags": [], 
                 "primary_category": None,
                 "confidence": "low",
                 "reasoning": f"Error during batch categorization: {str(e)}"}
                for i in range(len(tools_list))]

def load_csv(file_path):
    """Load NSFW tools data from CSV file"""
    try:
        df = pd.read_csv(file_path)
        print(f"Loaded {len(df)} tools from {file_path}")
        return df
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return None

def save_results(df, output_path):
    """Save categorized results to CSV and JSON"""
    # Save to CSV
    df.to_csv(output_path + ".csv", index=False)
    
    # Save to JSON for easier analysis
    results_json = df.to_dict(orient="records")
    with open(output_path + ".json", "w") as f:
        json.dump(results_json, f, indent=2)
    
    print(f"Results saved to {output_path}.csv and {output_path}.json")

def batch_process_tools(df, batch_size=10):
    """Process tools in batches using the batch API endpoint"""
    results_df = df.copy()
    
    # Add columns for categorization results
    results_df["category_tags"] = None
    results_df["primary_category"] = None
    results_df["confidence"] = None
    results_df["reasoning"] = None
    
    # Convert DataFrame to list of dictionaries
    tools = df.to_dict(orient="records")
    
    # Process in batches
    for i in tqdm(range(0, len(tools), batch_size), desc="Processing batches"):
        batch = tools[i:i+batch_size]
        
        # Prepare simplified batch for API call
        api_batch = [{"name": tool.get("name", tool.get("tool_name", "Unknown")),
                      "description": tool.get("description", tool.get("tool_description", ""))} 
                     for tool in batch]
        
        # Get batch categorization
        batch_results = batch_categorize_nsfw_tools(api_batch)
        
        # Map results back to DataFrame
        for j, result in enumerate(batch_results):
            idx = i + j
            if idx < len(results_df):
                try:
                    # Handle the case when result might be a string or other unexpected type
                    if not isinstance(result, dict):
                        print(f"Warning: Unexpected result type for tool {idx}: {type(result)}")
                        # Create a default result
                        result = {
                            "category_tags": [],
                            "primary_category": None,
                            "confidence": "low",
                            "reasoning": f"Error: Unexpected result type: {type(result)}"
                        }
                    
                    # Convert category tags to strings for better CSV compatibility
                    category_tags = result.get("category_tags", [])
                    results_df.at[idx, "category_tags"] = ", ".join([str(tag) for tag in category_tags])
                    results_df.at[idx, "primary_category"] = result.get("primary_category")
                    results_df.at[idx, "confidence"] = result.get("confidence")
                    results_df.at[idx, "reasoning"] = result.get("reasoning")
                except Exception as e:
                    print(f"Error processing result for tool {idx}: {e}")
                    print(f"Problematic result: {result}")
                    # Set default values in case of error
                    results_df.at[idx, "category_tags"] = ""
                    results_df.at[idx, "primary_category"] = None
                    results_df.at[idx, "confidence"] = "low"
                    results_df.at[idx, "reasoning"] = f"Error processing result: {str(e)}"
    
    return results_df

def individual_process_tools(df, max_workers=5):
    """Process tools individually using parallel execution"""
    results = []
    
    # Convert DataFrame to list of dictionaries
    tools = df.to_dict(orient="records")
    
    # Process tools in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = []
        for tool in tools:
            tool_name = tool.get("name", tool.get("tool_name", "Unknown"))
            tool_description = tool.get("description", tool.get("tool_description", ""))
            futures.append(executor.submit(categorize_nsfw_tool, tool_name, tool_description))
        
        # Collect results
        for i, future in enumerate(tqdm(concurrent.futures.as_completed(futures), total=len(futures), desc="Processing tools")):
            result = future.result()
            tool_result = tools[i].copy()
            
            # Convert category tags to strings for better CSV compatibility
            category_tags = result.get("category_tags", [])
            tool_result["category_tags"] = ", ".join([str(tag) for tag in category_tags])
            tool_result["primary_category"] = result.get("primary_category")
            tool_result["confidence"] = result.get("confidence")
            tool_result["reasoning"] = result.get("reasoning")
            
            results.append(tool_result)
    
    # Convert results back to DataFrame
    return pd.DataFrame(results)

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Categorize NSFW AI tools from a CSV file.')
    parser.add_argument('csv_file', type=str, help='Path to the CSV file containing NSFW tools')
    parser.add_argument('--batch', '-b', action='store_true', help='Use batch processing (default)')
    parser.add_argument('--individual', '-i', action='store_true', help='Use individual processing')
    parser.add_argument('--batch-size', '-s', type=int, default=5, help='Batch size for processing (default: 5)')
    parser.add_argument('--output', '-o', type=str, help='Path for output files (default: input filename with _categorized suffix)')
    
    args = parser.parse_args()
    
    # Set the input and output file paths
    input_file = args.csv_file
    output_path = args.output or os.path.splitext(input_file)[0] + "_categorized"
    
    # Load data
    df = load_csv(input_file)
    if df is None:
        return
    
    # Process tools
    print(f"Starting categorization of {len(df)} tools...")
    
    # Determine processing method based on arguments
    if args.individual:
        results_df = individual_process_tools(df)
    else:
        # Default to batch processing
        results_df = batch_process_tools(df, batch_size=args.batch_size)
    
    # Save results
    save_results(results_df, output_path)
    
    # Print summary
    print("\nCategorization Summary:")
    primary_category_counts = results_df["primary_category"].value_counts()
    for category, count in primary_category_counts.items():
        print(f"- Category {category}: {count}")
    
    # Count tools with multiple categories
    multi_category_count = results_df["category_tags"].apply(lambda x: len(str(x).split(", ")) > 1 if pd.notna(x) else False).sum()
    print(f"\nTools belonging to multiple categories: {multi_category_count}")

if __name__ == "__main__":
    main()
