from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask import Flask, render_template, request, redirect, jsonify, session, url_for
import os
from openpyxl import load_workbook
from num2words import num2words  # Convert numbers to words
from datetime import datetime
from flask import Flask, request, jsonify, send_file
import os
import shutil

def format_amount_to_words(amount):
    # Convert the number to words in rupees only (no decimals)
    amount_in_words = num2words(amount, to='currency', currency='INR')
    
    # Capitalize each word and remove commas, hyphens, and the word "Rupees"
    formatted_words = ' '.join(word.capitalize() for word in amount_in_words.replace("Rupees", "").replace(",", "").replace("-", " ").split())
    
    # Remove ", Zero Paise" if it appears in the formatted string
    formatted_words = formatted_words.replace("Zero Paise", "").strip()

    return f"{formatted_words} Only"



def print_colored(text, color):
    # Set color code based on input
    if color.lower() == "red":
        color_code = "\033[91m"
    elif color.lower() == "green":
        color_code = "\033[92m"
    else:
        color_code = "\033[0m"  # Default color if color input is invalid
    
    # Print the text in the specified color
    print(f"{color_code}{text}\033[0m")








def log_text_to_file(text):
    with open("output.txt", "a") as file:
        file.write(f"{datetime.now()} - {text}\n")


def zip_folder(folder_path, output_filename):
    """Zip the folder and return the zip file path."""
    zip_path = f"{output_filename}.zip"
    shutil.make_archive(output_filename, 'zip', folder_path)
    return zip_path