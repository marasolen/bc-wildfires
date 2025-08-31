import os
from PIL import Image
from PIL.ExifTags import TAGS
import json

directory = os.fsencode("images")
dataset = []
    
for file in os.listdir(directory):
    filename = os.fsdecode(file)
    if filename.endswith(".jpg"):
        image = Image.open("images/" + filename)
        exifdata = image.getexif()

        value = False

        for tagid in exifdata:
            tagname = TAGS.get(tagid, tagid)

            if tagname == "DateTime":
                value = exifdata.get(tagid)

        if value:
            dataset += [{
                "filename": filename,
                "datetime": value,
                "contents": "",
                "reason": ""
            }]

with open('data/image-data-1-base.json', 'w', encoding='utf-8') as f:
    json.dump(dataset, f, ensure_ascii=False, indent=4)
