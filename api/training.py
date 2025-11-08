# Core libraries
import random
import torch

# Data handling and processing
import pandas as pd
from sklearn.model_selection import train_test_split

# HuggingFace
from datasets import Dataset, DatasetDict
from transformers import (TrainingArguments, Trainer, M2M100ForConditionalGeneration, M2M100Tokenizer)

# Training config
DATASET_FILE = "en-pt.txt"
PRETRAINED_MODEL_NAME = "facebook/m2m100_418M"
OUTPUT_DIR = "./.doculearn_finetuned_train"
FINAL_MODEL_DIR = "./doculearn_finetuned_final"
EPOCHS = 2

# Set random seeds for reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
torch.manual_seed(RANDOM_SEED)


df = pd.read_csv(DATASET_FILE, sep='\t', names=['en', 'pt'], usecols=[0, 1], index_col=False)
dataset_pandas = Dataset.from_pandas(df)
dataset = DatasetDict({ 'books': dataset_pandas })

first_row = dataset['books'][0]
print(f"Dataset '{DATASET_FILE}' loaded successfully!")
print(f"Dataset first row: {first_row}")
print()

# Check for GPU availability and set device
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Using device: {device}")

# Display GPU information if available
if torch.cuda.is_available():
    print(f"GPU Name: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")

# Convert HuggingFace dataset to pandas DataFrame for easier manipulation
train_data = pd.DataFrame(dataset['books'])

# Split data into train and test sets (80/20 split)
train_data_full, test_data = train_test_split(
    train_data, 
    test_size=0.2, 
    random_state=42
)

# Limit dataset size for efficient training
# Using smaller subsets to reduce training time while maintaining quality
train_data = train_data_full.head(5000)  # 5K training examples
test_data = test_data.head(2000)         # 1K testing examples

print(f"Training data shape: {train_data.shape}")
print(f"Testing data shape: {test_data.shape}")
print(f"Total examples: {len(train_data) + len(test_data)}")
print()

# Display sample of the training data to verify structure
print("Sample Training Data:")
print(train_data.head())
print()

# Check for any missing values
print(f"Missing Values Check:")
print(f"English missing: {train_data['en'].isnull().sum()}")
print(f"Portuguese missing: {train_data['pt'].isnull().sum()}")

# Convert pandas DataFrames to HuggingFace Dataset objects
train_dataset = Dataset.from_pandas(train_data, split='train')
test_dataset = Dataset.from_pandas(test_data, split='test')

# Load the new model and the tokenizer
print(f"Loading pre-trained M2M100 model ({PRETRAINED_MODEL_NAME})...")
model = M2M100ForConditionalGeneration.from_pretrained(PRETRAINED_MODEL_NAME)
tokenizer = M2M100Tokenizer.from_pretrained(PRETRAINED_MODEL_NAME)

# Try to move the model from GPU (CUDA) if available
if torch.cuda.is_available():
    model.to("cuda")
    print("Model loaded in GPU (CUDA)")
else:
    print("GPU (CUDA) not found. Model loaded in CPU.")

# Define the languages from the dataset to the tokenizer
tokenizer.src_lang = "en"
tokenizer.tgt_lang = "pt"

print(f"Model loaded successfully!")
print(f"Model parameters: {model.num_parameters():,}")
print(f"Tokenizer vocabulary size: {len(tokenizer)}")
print()

# Convert simple language codes to M2M100-specific language tokens.
def get_lang_code(language):
    lang_map = {
        'en': 'en',  # English language code
        'pt': 'pt'   # Portuguese language code
    }

    return lang_map.get(language.lower(), 'en')

def tokenize_function(rows):
    # English to Portuguese as default
    src_language = 'en'
    tgt_language = 'pt'

    # Data Augmentation: Randomly swap source and target languages
    if random.randint(0, 1) == 1:
        src_language, tgt_language = tgt_language, src_language

    # Get M2M100 language codes
    src_lang_code = get_lang_code(src_language) # 'en' or 'pt'
    tgt_lang_code = get_lang_code(tgt_language) # 'pt' or 'en'
    
    tokenizer.src_lang = src_lang_code
    tokenizer.src_lang = tgt_lang_code
    prompt = [row for row in rows[src_language]]
    
    # Tokenize source text (input)
    encoding = tokenizer(
        prompt, 
        padding="max_length", 
        truncation=True, 
        return_tensors="pt", 
        max_length=256
    )
    
    # Tokenize target text (labels)
    labels = tokenizer(
        rows[tgt_language], 
        padding="max_length", 
        truncation=True, 
        return_tensors="pt", 
        max_length=256
    )
    
    return {
        'input_ids': encoding.input_ids.tolist(),
        'attention_mask': encoding.attention_mask.tolist(),
        'labels': labels.input_ids.tolist()
    }

# Apply tokenization to training dataset
tokenized_train_dataset = train_dataset.map(
    tokenize_function, 
    batched=True,
    desc="Tokenizing training data"
)

# Apply tokenization to test dataset
tokenized_test_dataset = test_dataset.map(
    tokenize_function, 
    batched=True,
    desc="Tokenizing test data"
)

# Keep only the columns needed for training: input_ids, attention_mask, labels
columns_to_remove = ['en', 'pt', 'src_language', 'prompt', '__index_level_0__']

# Remove unnecessary columns from training dataset
for col in columns_to_remove:
    if col in tokenized_train_dataset.column_names:
        tokenized_train_dataset = tokenized_train_dataset.remove_columns([col])

# Remove unnecessary columns from test dataset  
for col in columns_to_remove:
    if col in tokenized_test_dataset.column_names:
        tokenized_test_dataset = tokenized_test_dataset.remove_columns([col])

print("Tokenization completed successfully!")
print(f"Tokenized train dataset: {tokenized_train_dataset}")
print(f"Tokenized test dataset: {tokenized_test_dataset}")
print(f"Train dataset columns: {tokenized_train_dataset.column_names}")
print(f"Test dataset columns: {tokenized_test_dataset.column_names}")

# Get original data for verification
original_test_example = test_dataset[3]  # Get from original dataset
tokenized_example = tokenized_test_dataset[3]  # Get from tokenized dataset

print("Tokenization Verification")
print(f"Original English text: {original_test_example['en']}")
print(f"Original Portuguese text: {original_test_example['pt']}")
print()
print("Tokenized Input (first 10 tokens)")
print(f"Input IDs length: {len(tokenized_example['input_ids'])}")
print(f"Input IDs (first 10): {tokenized_example['input_ids'][:10]}")
print()
print("Tokenized Labels (first 10 tokens)")
print(f"Labels length: {len(tokenized_example['labels'])}")
print(f"Labels (first 10): {tokenized_example['labels'][:10]}")
print()
print(f"Attention mask length: {len(tokenized_example['attention_mask'])}")
print(f"Attention mask (first 10): {tokenized_example['attention_mask'][:10]}")

# Verify we only have the necessary columns
print()
print(f"Dataset columns after cleaning: {tokenized_test_dataset.column_names}")

# Check data types
print()
print(f"Data Types:")
print(f"Input IDs type: {type(tokenized_example['input_ids'])}")
print(f"Labels type: {type(tokenized_example['labels'])}")
print(f"Attention mask type: {type(tokenized_example['attention_mask'])}")

# Shuffle datasets to ensure random distribution during training
# This helps prevent overfitting to data ordering patterns
tokenized_train_dataset = tokenized_train_dataset.shuffle(seed=RANDOM_SEED)
tokenized_test_dataset = tokenized_test_dataset.shuffle(seed=RANDOM_SEED)

print("Datasets shuffled successfully!")
print(f"Final training dataset shape: {tokenized_train_dataset.shape}")

# Test English to Portuguese translation
sample_english = "He is playing there."
print("Testing English → Portuguese translation (M2M100 pre-trained)")
print(f"Input: {sample_english}")

# Generate Portuguese translation
tokenizer.src_lang = "en"
with torch.no_grad():
    inputs = tokenizer(sample_english, return_tensors='pt')
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    result = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.lang_code_to_id["pt"], 
        max_length=512
    )
    
    translation = tokenizer.batch_decode(result, skip_special_tokens=True)[0]

print(f"Translation: {translation}")

# Test Portuguese to English translation
sample_portuguese = "Ele está brincando lá."
print("Testing Portuguese → English translation (M2M100 pre-trained)")
print(f"Input: {sample_portuguese}")

# Generate English translation
tokenizer.src_lang = "pt"
with torch.no_grad():
    inputs = tokenizer(sample_portuguese, return_tensors='pt')
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    result = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.lang_code_to_id["en"],
        max_length=512
    )
    
    translation = tokenizer.batch_decode(result, skip_special_tokens=True)[0]

print(f"Translation: {translation}")


# Initialize lists to store training metrics
train_losses = []
val_losses = []

# Configure training arguments
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    
    # Optimize RAM/VRAM
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    gradient_accumulation_steps=16,
    
    learning_rate=5e-5,
    num_train_epochs=EPOCHS,
    eval_strategy="epoch",
    save_strategy="epoch",
    logging_strategy="epoch",
    warmup_steps=100,
    report_to="none",
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    greater_is_better=False,
    dataloader_pin_memory=False,
    remove_unused_columns=False,
)

# Initialize the Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_train_dataset,
    eval_dataset=tokenized_test_dataset,
    tokenizer=tokenizer
)

print()
print("Training configuration completed successfully!")
print(f"Output directory: {OUTPUT_DIR}")
print(f"Training examples: {len(tokenized_train_dataset)}")
print(f"Validation examples: {len(tokenized_test_dataset)}")

# Start training process
trainer.train()

# Save the final fine-tuned model
print(f"Saving final model to {FINAL_MODEL_DIR}")
trainer.save_model(FINAL_MODEL_DIR)
tokenizer.save_pretrained(FINAL_MODEL_DIR)
print("Fine-tuned model exported successfully!")
