import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib
import json

# Load the recipes dataset
with open('data/recipes.json') as f:
    recipes = json.load(f)

# Prepare the data
data = pd.DataFrame(recipes)
X = data['ingredients'].apply(lambda x: ' '.join(x))  # Combine ingredients into a single string
y = data['title']  # Target variable

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Vectorize the ingredients
vectorizer = CountVectorizer()
X_train_vectorized = vectorizer.fit_transform(X_train)

# Train the model
model = MultinomialNB()
model.fit(X_train_vectorized, y_train)

# Save the trained model and vectorizer
joblib.dump(model, 'model/recipe_recommendation_model.pkl')
joblib.dump(vectorizer, 'model/vectorizer.pkl')