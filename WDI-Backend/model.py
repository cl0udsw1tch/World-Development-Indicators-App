from sklearn.linear_model import LinearRegression
from typing import * 

class Model:

    def __init__(self):
        self.model = LinearRegression()

    def train(self, X: List[List[int]], y: List[int]):
        self.model.fit(X, y)

    def predict(self, x: List[List[int]]):
        return self.model.predict(x)
