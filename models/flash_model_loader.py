# models/flash_model_loader.py
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

def load_flash_model(model_name="meta-llama/Llama-2-7b-chat-hf"):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,
        device_map='auto',
        attn_implementation='flash_attention_2'
    )
    return tokenizer, model
