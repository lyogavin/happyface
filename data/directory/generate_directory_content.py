import json
import os
import logging
import argparse
import time
from concurrent.futures import ThreadPoolExecutor
import pandas as pd
from tqdm import tqdm
from functools import wraps
import random
from openai import AzureOpenAI
import sys
from openai import OpenAI
# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Retry decorator (copied from categorize_tools.py for consistency)
def retry(tries=3, delay=2, backoff=2, jitter=(1, 3), logger=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            mtries, mdelay = tries, delay
            while mtries > 0:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    msg = f"{str(e)}, Retrying in {mdelay} seconds..."
                    if logger:
                        logger.warning(msg)
                    else:
                        print(msg)
                    time.sleep(mdelay + random.uniform(*jitter) if jitter else mdelay)
                    mtries -= 1
                    mdelay *= backoff
            return func(*args, **kwargs)  # Final attempt
        return wrapper
    return decorator

@retry(tries=3, delay=2, backoff=2, jitter=(1, 3), logger=logger)
def generate_directory_content(tool_data):
    """
    Generate directory content for a single NSFW tool using LLM
    """
    try:
        # Extract relevant information from tool data
        tool_name = tool_data.get('name', 'Unknown Tool')
        tool_description = tool_data.get('description', '')
        tool_html = tool_data.get('html', '')
        tool_url = tool_data.get('url', '')
        categories = tool_data.get('categories', [])
        
        # Extract additional fields from the original data structure
        images = tool_data.get('图片', [])
        categories_cn = tool_data.get('类别', [])
        
        # Extract scrape data if available
        scrape_data = tool_data.get('scrape_data', {})
        metadata = scrape_data.get('metadata', {})
        meta_description = metadata.get('description', '')
        og_description = metadata.get('og:description', '')
        markdown_content = scrape_data.get('markdown', '')
        
        # Construct prompt for the LLM, requesting XML-tagged output
        prompt = f"""
        You are creating detailed directory content for an NSFW tool. Based on the provided information, 
        generate the following fields with XML tags as shown in the examples:
        
        Tool Name: {tool_name}
        URL: {tool_url}
        Description: {tool_description}
        Categories: {', '.join(categories) if categories else 'None'}
        Chinese Categories: {', '.join(categories_cn) if categories_cn else 'None'}
        
        Image URLs from the original data: {json.dumps(images)}
        
        Meta Description: {meta_description}
        OG Description: {og_description}
        
        Markdown Content: {markdown_content}
        
        HTML Content: {tool_html}
        
        Generate these directory fields with XML tags:
        1. <images>List of key image URLs from HTML, one per line</images>
        2. <video>Key video URL if present, otherwise leave empty</video>
        3. <pros_and_cons>
           <pros>
           - Pro 1
           - Pro 2
           - Pro 3
           </pros>
           <cons>
           - Con 1
           - Con 2
           - Con 3
           </cons>
           </pros_and_cons>
        4. <faq>
           <question>Question 1?</question>
           <answer>Answer 1</answer>
           
           <question>Question 2?</question>
           <answer>Answer 2</answer>
           
           <question>Question 3?</question>
           <answer>Answer 3</answer>
           </faq>
        5. <tags>tag1, tag2, tag3, tag4, tag5</tags>
        6. <detailed_introduction>Write a detailed introduction paragraph here...</detailed_introduction>
        7. <pricing_details>Detailed pricing information including tiers and plans...</pricing_details>
        
        Make sure that all content is placed inside the appropriate XML tags.
        """
        os.environ["PERPLEXITY_API_KEY"] = ""

        client = OpenAI(
          api_key=os.environ["PERPLEXITY_API_KEY"],
          base_url="https://api.perplexity.ai"
      )
        
        response = client.chat.completions.create(
            model="r1-1776",
            messages=[
                {"role": "system", "content": "You are a helpful assistant creating NSFW directory content with XML-tagged output."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        # Extract the generated content from the response
        content = response.choices[0].message.content.strip()
        
        # Parse the XML content to extract structured data
        try:
            # Extract each XML tag content, ignoring any text outside the tags
            images_list = []
            video_url = None
            pros_list = []
            cons_list = []
            faq_items = []
            tags_list = []
            detailed_intro = ""
            pricing_info = ""
            
            # Extract images
            images_match = extract_xml_content(content, "images")
            if images_match:
                images_list = [img.strip() for img in images_match.split('\n') if img.strip() and not img.strip().startswith('-')]
            
            # Extract video
            video_match = extract_xml_content(content, "video")
            if video_match and video_match.strip():
                video_url = video_match.strip()
            
            # Extract pros and cons
            pros_cons_xml = extract_xml_content(content, "pros_and_cons")
            pros_match = extract_xml_content(pros_cons_xml, "pros")
            if pros_match:
                pros_list = [p.strip() for p in pros_match.split('\n') if p.strip() and p.strip().startswith('-')]
                # Remove leading dash and whitespace
                pros_list = [p[1:].strip() if p.startswith('-') else p for p in pros_list]
                
            cons_match = extract_xml_content(pros_cons_xml, "cons")
            if cons_match:
                cons_list = [c.strip() for c in cons_match.split('\n') if c.strip() and c.strip().startswith('-')]
                # Remove leading dash and whitespace
                cons_list = [c[1:].strip() if c.startswith('-') else c for c in cons_list]
            
            # If splitting by lines with dashes didn't work, try regex to find list items
            if not pros_list and pros_match:
                import re
                pros_list = re.findall(r'-\s*(.*?)(?=\n-|\n\n|$)', pros_match, re.DOTALL)
                pros_list = [p.strip() for p in pros_list if p.strip()]
                
            if not cons_list and cons_match:
                import re
                cons_list = re.findall(r'-\s*(.*?)(?=\n-|\n\n|$)', cons_match, re.DOTALL)
                cons_list = [c.strip() for c in cons_list if c.strip()]
            
            # Extract FAQ
            faq_xml = extract_xml_content(content, "faq")
            questions = extract_xml_content_multiple(faq_xml, "question")
            answers = extract_xml_content_multiple(faq_xml, "answer")
            
            # Match questions with answers
            for i in range(min(len(questions), len(answers))):
                faq_items.append({
                    "question": questions[i].strip(),
                    "answer": answers[i].strip()
                })
            
            # Extract tags
            tags_match = extract_xml_content(content, "tags")
            if tags_match:
                tags_list = [tag.strip() for tag in tags_match.split(',') if tag.strip()]
            
            # Extract detailed introduction
            detailed_intro_match = extract_xml_content(content, "detailed_introduction")
            if detailed_intro_match:
                detailed_intro = detailed_intro_match.strip()
            
            # Extract pricing details
            pricing_match = extract_xml_content(content, "pricing_details")
            if pricing_match:
                pricing_info = pricing_match.strip()
            
            # Create structured result
            content_dict = {
                "images": images_list,
                "video": video_url,
                "pros_and_cons": {
                    "pros": pros_list,
                    "cons": cons_list
                },
                "faq": faq_items,
                "tags": tags_list,
                "detailed_introduction": detailed_intro,
                "pricing_details": pricing_info
            }
            
            # Fallback: If we didn't find tags in XML format, try to extract any that might be there
            if not content_dict["tags"] and "tags" in content.lower():
                import re
                tags_section = re.search(r'tags:?\s*(.*?)(?=\n\n|\n[A-Z]|$)', content, re.IGNORECASE | re.DOTALL)
                if tags_section:
                    extracted_tags = tags_section.group(1).strip()
                    content_dict["tags"] = [tag.strip() for tag in re.split(r',|\n-', extracted_tags) if tag.strip()]
            
            # Merge the generated content with the original tool data
            result = {**tool_data, **content_dict}
            
            # Log the extracted fields for debugging
            logger.debug(f"Extracted content for {tool_name}:")
            logger.debug(f"- Images: {len(content_dict['images'])}")
            logger.debug(f"- Video: {'Yes' if content_dict['video'] else 'No'}")
            logger.debug(f"- Pros: {len(content_dict['pros_and_cons']['pros'])}")
            logger.debug(f"- Cons: {len(content_dict['pros_and_cons']['cons'])}")
            logger.debug(f"- FAQ items: {len(content_dict['faq'])}")
            logger.debug(f"- Tags: {len(content_dict['tags'])}")
            logger.debug(f"- Detailed intro: {len(content_dict['detailed_introduction'])} chars")
            logger.debug(f"- Pricing details: {len(content_dict['pricing_details'])} chars")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to parse XML for {tool_name}. Error: {str(e)}. Raw response: {content[:100]}...")
            # Create a basic structure for the error case
            return {
                **tool_data,
                "images": [],
                "video": None,
                "pros_and_cons": {"pros": [], "cons": []},
                "faq": [],
                "tags": [],
                "detailed_introduction": "Error generating introduction",
                "pricing_details": "Error extracting pricing details",
                "generation_error": True,
                "raw_response": content[:500] + "..." if len(content) > 500 else content  # Store partial response for debugging
            }
            
    except Exception as e:
        logger.error(f"Error generating directory content for {tool_data.get('name', 'unknown tool')}: {str(e)}")
        raise

# Helper functions to extract XML content - more robust implementations
def extract_xml_content(text, tag):
    """
    Extract content between XML tags, more robust against malformed XML
    Returns empty string if tags not found
    """
    import re
    pattern = f"<{tag}>(.*?)</{tag}>"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else ""

def extract_xml_content_multiple(text, tag):
    """
    Extract multiple instances of content between XML tags
    Returns empty list if tags not found
    """
    import re
    pattern = f"<{tag}>(.*?)</{tag}>"
    matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
    return [m.strip() for m in matches]

@retry(tries=3, delay=2, backoff=2, jitter=(1, 3), logger=logger)
def batch_generate_directory_content(tools_batch):
    """
    Process a batch of tools to generate directory content
    """
    results = []
    for tool in tools_batch:
        try:
            result = generate_directory_content(tool)
            results.append(result)
        except Exception as e:
            logger.error(f"Failed to process tool {tool.get('name', 'unknown')}: {str(e)}")
            # Add the original tool data with error flag
            tool['generation_error'] = True
            results.append(tool)
    return results

def load_json_file(file_path):
    """
    Load tools data from a JSON file
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Error loading JSON file {file_path}: {str(e)}")
        sys.exit(1)

def batch_process_tools(tools_list, batch_size=5, output_path=None, checkpoint_interval=1):
    """
    Process tools in batches to manage API rate limits
    With on-the-fly saving and resume capability
    """
    results = []
    # Check if there's a checkpoint file to resume from
    checkpoint_path = f"{output_path}.checkpoint" if output_path else "directory_checkpoint.json"
    processed_ids = set()
    
    # Try to load previously processed results
    if os.path.exists(checkpoint_path):
        try:
            logger.info(f"Found checkpoint file {checkpoint_path}, attempting to resume...")
            with open(checkpoint_path, 'r', encoding='utf-8') as f:
                results = json.load(f)
            # Get IDs of already processed tools
            processed_ids = {item.get('id', item.get('name', str(i))) for i, item in enumerate(results)}
            logger.info(f"Resuming from checkpoint with {len(results)} already processed tools")
        except Exception as e:
            logger.warning(f"Error loading checkpoint file: {str(e)}. Starting fresh.")
            results = []
    
    # Filter out already processed tools
    tools_to_process = []
    for tool in tools_list:
        tool_id = tool.get('id', tool.get('name', None))
        if tool_id and tool_id in processed_ids:
            logger.info(f"Skipping already processed tool: {tool.get('name', 'unknown')}")
        else:
            tools_to_process.append(tool)
    
    logger.info(f"Processing {len(tools_to_process)} tools out of {len(tools_list)} total")
    
    total_batches = (len(tools_to_process) + batch_size - 1) // batch_size
    checkpoint_counter = 0
    
    for i in range(0, len(tools_to_process), batch_size):
        batch = tools_to_process[i:i+batch_size]
        logger.info(f"Processing batch {i//batch_size + 1}/{total_batches} ({len(batch)} tools)")
        
        batch_results = batch_generate_directory_content(batch)
        results.extend(batch_results)
        checkpoint_counter += len(batch)
        
        # Save checkpoint after each batch
        if output_path and checkpoint_counter >= checkpoint_interval:
            save_checkpoint(results, checkpoint_path)
            checkpoint_counter = 0
            logger.info(f"Checkpoint saved with {len(results)} tools")
        
        # Add delay between batches to prevent rate limiting
        if i + batch_size < len(tools_to_process):
            time.sleep(2)
    
    # Save final checkpoint
    if output_path:
        save_checkpoint(results, checkpoint_path)
    
    return results

def parallel_process_tools(tools_list, max_workers=5, output_path=None, checkpoint_interval=5):
    """
    Process tools in parallel using ThreadPoolExecutor
    With on-the-fly saving and resume capability
    """
    # Check if there's a checkpoint file to resume from
    checkpoint_path = f"{output_path}.checkpoint" if output_path else "directory_checkpoint.json"
    processed_results = []
    processed_ids = set()
    
    # Try to load previously processed results
    if os.path.exists(checkpoint_path):
        try:
            logger.info(f"Found checkpoint file {checkpoint_path}, attempting to resume...")
            with open(checkpoint_path, 'r', encoding='utf-8') as f:
                processed_results = json.load(f)
            # Get IDs of already processed tools
            processed_ids = {item.get('id', item.get('name', str(i))) for i, item in enumerate(processed_results)}
            logger.info(f"Resuming from checkpoint with {len(processed_results)} already processed tools")
        except Exception as e:
            logger.warning(f"Error loading checkpoint file: {str(e)}. Starting fresh.")
            processed_results = []
    
    # Filter out already processed tools
    tools_to_process = []
    for tool in tools_list:
        tool_id = tool.get('id', tool.get('name', None))
        if tool_id and tool_id in processed_ids:
            logger.info(f"Skipping already processed tool: {tool.get('name', 'unknown')}")
        else:
            tools_to_process.append(tool)
    
    logger.info(f"Processing {len(tools_to_process)} tools out of {len(tools_list)} total")
    
    # If all tools are already processed, return the results
    if not tools_to_process:
        logger.info("All tools have already been processed.")
        return processed_results
    
    # Set up a lock for thread-safe checkpoint saving
    import threading
    checkpoint_lock = threading.Lock()
    checkpoint_counter = 0
    
    # Use a thread-safe list to collect results
    results = processed_results.copy()
    
    def process_and_save(tool):
        nonlocal checkpoint_counter
        try:
            result = generate_directory_content(tool)
            
            # Thread-safe update of results and checkpoint
            with checkpoint_lock:
                results.append(result)
                checkpoint_counter += 1
                
                # Save checkpoint at intervals
                if output_path and checkpoint_counter >= checkpoint_interval:
                    save_checkpoint(results, checkpoint_path)
                    checkpoint_counter = 0
                    logger.info(f"Checkpoint saved with {len(results)} tools")
            
            return result
        except Exception as e:
            logger.error(f"Error processing {tool.get('name', 'unknown')}: {str(e)}")
            tool['generation_error'] = True
            
            # Still save in case of error
            with checkpoint_lock:
                results.append(tool)
                checkpoint_counter += 1
                
                # Save checkpoint at intervals
                if output_path and checkpoint_counter >= checkpoint_interval:
                    save_checkpoint(results, checkpoint_path)
                    checkpoint_counter = 0
            
            return tool
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        list(tqdm(
            executor.map(process_and_save, tools_to_process), 
            total=len(tools_to_process), 
            desc="Generating directory content"
        ))
    
    # Save final checkpoint
    if output_path:
        save_checkpoint(results, checkpoint_path)
        # Once complete, you can optionally remove the checkpoint file
        try:
            if os.path.exists(checkpoint_path):
                # Keep a backup copy just in case
                backup_checkpoint = f"{checkpoint_path}.bak"
                import shutil
                shutil.copy2(checkpoint_path, backup_checkpoint)
                logger.info(f"Created backup of checkpoint at {backup_checkpoint}")
        except Exception as e:
            logger.warning(f"Error creating backup checkpoint: {str(e)}")
    
    return results

def save_checkpoint(results, checkpoint_path):
    """
    Save the current results to a checkpoint file in a fault-tolerant way
    """
    try:
        # Create a temporary file first
        temp_path = f"{checkpoint_path}.tmp"
        with open(temp_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # Atomic rename for better reliability
        if os.path.exists(checkpoint_path):
            # Keep one previous version as backup
            backup_path = f"{checkpoint_path}.prev"
            if os.path.exists(backup_path):
                os.remove(backup_path)
            os.rename(checkpoint_path, backup_path)
        
        os.rename(temp_path, checkpoint_path)
        return True
    except Exception as e:
        logger.error(f"Error saving checkpoint: {str(e)}")
        # Try a direct save if atomic approach failed
        try:
            with open(checkpoint_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e2:
            logger.error(f"Failed to save checkpoint even with direct approach: {str(e2)}")
            return False

def save_results(results, output_path):
    """
    Save the processed results to a JSON file
    """
    try:
        # Create a temporary file first
        temp_path = f"{output_path}.tmp"
        with open(temp_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # Atomic rename for better reliability
        if os.path.exists(output_path):
            # Keep one previous version as backup
            backup_path = f"{output_path}.bak"
            if os.path.exists(backup_path):
                os.remove(backup_path)
            os.rename(output_path, backup_path)
        
        os.rename(temp_path, output_path)
        logger.info(f"Results saved to {output_path}")
        
        # Check if checkpoint file exists and can be removed
        checkpoint_path = f"{output_path}.checkpoint"
        if os.path.exists(checkpoint_path):
            # Keep a backup copy just in case
            backup_checkpoint = f"{checkpoint_path}.final"
            import shutil
            shutil.copy2(checkpoint_path, backup_checkpoint)
            logger.info(f"Processing complete. Checkpoint saved as {backup_checkpoint}")
    except Exception as e:
        logger.error(f"Error saving results to {output_path}: {str(e)}")
        # Save to a backup file
        backup_path = f"{output_path}.backup.{int(time.time())}.json"
        try:
            with open(backup_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            logger.info(f"Results saved to backup file {backup_path}")
        except:
            logger.critical("Failed to save results even to backup file")

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Generate directory content for NSFW tools')
    parser.add_argument('--input', required=True, help='Path to input JSON file with tools data')
    parser.add_argument('--output', required=True, help='Path to output JSON file for results')
    parser.add_argument('--batch-size', type=int, default=5, help='Batch size for processing')
    parser.add_argument('--parallel', action='store_true', help='Use parallel processing')
    parser.add_argument('--max-workers', type=int, default=5, help='Maximum number of worker threads')
    parser.add_argument('--checkpoint-interval', type=int, default=1, help='Save checkpoint after processing this many tools')
    parser.add_argument('--resume', action='store_true', help='Resume from checkpoint if it exists')
    
    args = parser.parse_args()
    
    # Set environment variables if provided as arguments
    
    # Check required environment variables
    # Load input data
    logger.info(f"Loading data from {args.input}")
    tools_data = load_json_file(args.input)
    
    # Process tools
    logger.info(f"Processing {len(tools_data)} tools")
    start_time = time.time()
    
    if args.parallel:
        results = parallel_process_tools(
            tools_data, 
            args.max_workers, 
            args.output,
            args.checkpoint_interval
        )
    else:
        results = batch_process_tools(
            tools_data, 
            args.batch_size, 
            args.output,
            args.checkpoint_interval
        )
    
    processing_time = time.time() - start_time
    logger.info(f"Processing completed in {processing_time:.2f} seconds")
    
    # Save final results
    logger.info(f"Saving results to {args.output}")
    save_results(results, args.output)
    
    # Print summary
    success_count = len([r for r in results if not r.get('generation_error', False)])
    logger.info(f"Summary: {success_count}/{len(results)} tools processed successfully")

if __name__ == "__main__":
    main()
