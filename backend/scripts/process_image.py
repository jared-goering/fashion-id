import sys
import time
import pyautogui
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import json

def process_image(image_path):
    """
    Processes an image by using Chrome to perform a reverse image search and collect related search results.

    Args:
        image_path (str): The relative path to the image to be processed.

    Returns:
        str: JSON string containing the results of the reverse image search or an error message.
    """
    # Convert relative image path to absolute path
    abs_image_path = os.path.abspath(image_path)
    file_url = f"file://{abs_image_path}"

    # Path to the ChromeDriver executable
    chromedriver_path = '/Users/jared/fashion-identifier/backend/chromedriver'

    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')

    # Initialize WebDriver
    service = Service(chromedriver_path)
    driver = webdriver.Chrome(service=service, options=chrome_options)

    results = []
    try:
        # Open the image in Chrome
        driver.get(file_url)

        # Wait for the image to load and have non-zero dimensions
        image_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, 'img'))
        )
        WebDriverWait(driver, 10).until(lambda driver: image_element.size['width'] > 0 and image_element.size['height'] > 0)

        # Scroll image into view
        driver.execute_script("arguments[0].scrollIntoView();", image_element)

        # Right-click on the image
        action = webdriver.ActionChains(driver)
        action.context_click(image_element).perform()

        # Wait for the context menu to appear
        time.sleep(1)

        # Use pyautogui to click on "Search Image with Google" (manually determined coordinates)
        pyautogui.moveTo(805, 720)
        pyautogui.click()

        # Wait for the results page to load
        time.sleep(20)

        # Use pyautogui to click on "Open in new window" (update coordinates as necessary)
        pyautogui.moveTo(1159, 215)
        pyautogui.click()

        # Wait for the new tab to open and load
        time.sleep(10)

        # Switch to the new tab
        driver.switch_to.window(driver.window_handles[-1])

        # Locate and collect results from specified domains
        domains = ["amazon.com", "ebay.com", "on.com", "nike.com", "depop.com", "poshmark.com"]
        related_searches_xpath = '//a[' + ' or '.join([f'contains(@href, "{domain}")' for domain in domains]) + ']'
        related_searches = driver.find_elements(By.XPATH, related_searches_xpath)[:10]
        
        for item in related_searches:
            text = item.text
            link = item.get_attribute('href')
            results.append({'text': text, 'link': link})

    except Exception as e:
        # Capture and return any errors
        results = {"error": str(e)}

    finally:
        # Ensure the WebDriver is quit regardless of success or failure
        driver.quit()
    
    return json.dumps(results)

if __name__ == "__main__":
    # Entry point for the script when run from the command line
    image_path = sys.argv[1]  # Get the image path from command line arguments
    results = process_image(image_path)
    print(results)
