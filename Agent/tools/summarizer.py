# agent/tools/summarizer.py
from models.flash_model_loader import load_flash_model
import torch

tokenizer, model = load_flash_model()

def summarize_text(text, max_length=200):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=4096).to(model.device)
    summary_ids = model.generate(**inputs, max_length=max_length, do_sample=False)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary
