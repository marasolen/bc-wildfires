import os
import json
import cv2
import numpy as np

with open('data/image-data-2-coded.json', 'r', encoding='utf-8') as f:
    dataset = json.load(f)
    
for imagedata in dataset:
    image = cv2.imread('images/' + imagedata["filename"])
    averagecolor = np.mean(image, axis=(0, 1))
    imagedata["colour"] = '#%02x%02x%02x' % (round(averagecolor[0]), round(averagecolor[1]), round(averagecolor[2]))

with open('data/image-data-3-with-colours.json', 'w', encoding='utf-8') as f:
    json.dump(dataset, f, ensure_ascii=False, indent=4)
