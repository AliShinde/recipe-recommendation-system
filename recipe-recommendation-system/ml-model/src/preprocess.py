import pandas as pd
import json

def load_recipes(file_path):
    with open(file_path, 'r') as file:
        recipes = json.load(file)
    return pd.DataFrame(recipes)

def preprocess_recipes(df):
    # Convert ingredients to a list of strings
    df['ingredients'] = df['ingredients'].apply(lambda x: ', '.join(x))
    
    # Normalize the recipe titles
    df['title'] = df['title'].str.lower().str.strip()
    
    return df

def save_preprocessed_data(df, output_path):
    df.to_csv(output_path, index=False)

if __name__ == "__main__":
    recipes_df = load_recipes('data/recipes.json')
    preprocessed_df = preprocess_recipes(recipes_df)
    save_preprocessed_data(preprocessed_df, 'data/preprocessed_recipes.csv')