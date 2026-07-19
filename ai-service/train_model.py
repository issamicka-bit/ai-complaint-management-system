# train_model.py
# Hii script inasoma training_data.csv na kufundisha model ya
# kuainisha malalamiko kwa category (Water, Electricity, Roads, Sanitation).
#
# Endesha kwa: python train_model.py
# Itatengeneza faili mbili: model.pkl na vectorizer.pkl

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

print("Loading training data...")
data = pd.read_csv("training_data.csv")
print(f"Loaded {len(data)} examples across categories: {data['category'].unique()}")

X = data["text"]
y = data["category"]

# Geuza maandishi kuwa namba (TF-IDF) ili model iweze kuelewa
# ngram_range=(1,2) inamaanisha model inaangalia maneno moja moja NA jozi za maneno
vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
X_vectorized = vectorizer.fit_transform(X)

# Gawanya data: 80% kufundisha, 20% kutesti usahihi
X_train, X_test, y_train, y_test = train_test_split(
    X_vectorized, y, test_size=0.2, random_state=42
)

print("Training model...")
model = LinearSVC()
model.fit(X_train, y_train)

# Angalia usahihi wa model kwenye data isiyofundishwa nayo
predictions = model.predict(X_test)
print("\n=== Model Performance ===")
print(classification_report(y_test, predictions))

# Hifadhi model na vectorizer kwenye faili
joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")
print("\nModel saved as model.pkl and vectorizer.pkl")