Implementation of Image Manipulation Packages using Gemini API

The Gemini Will be used to generate the prompt for the image manipulation packages.

## Prompt For Image Manipulation infrastructure

### Part 1
```
so the workflow of the project is 
flowchart TD
    A[Thumbnail Editor] --> B[User Uploads Video]
    B --> C{Image Selection}
    C -->|System Selected| D[System Chooses Image]
    C -->|User Selected| E[User Chooses Image]
    D --> F[System Asks for Instructions]
    E --> F
    F --> G{User Instructions Provided}
    G --> H[Preset Applied]
    H --> I{Enhancements Applied}
    I -->|Text Elements| J[Overlay Texts: Titles, subtitles, attention-grabbing words]
    I -->|Graphics & Visuals| K[Backgrounds, shadows, outlines, glows]
    I -->|Images & Emphasis| L[Cutouts, expressions, arrows, icons]
    I -->|Color & Theme| M[Brand colors, contrast, filters]
    I -->|Additional Elements| N[Logos, part numbers, CTA]
    J --> O[Final Thumbnail]
    K --> O
    L --> O
    M --> O
    N --> OZ



in simple 
upload image with instructions -> Gemini create instructions for the packages like jimp, Sharp, Remove BG API to create a image -> User gets the Image in the preview section in the Carousel as a output.


```



### part 2
```
ok so How can Gemini Handle the server side operations. Like Instructing them the libraries to to changes these things and those things. 
for example User Uploaded a image and Gave a instructions like "I want to create a thumbnail, it is about our castle in the anterctica" for thumbnail caption. The gemini will then analyze it and generate a instruction "This is how we build a castle in the Anterctica" and a instruction probably in json for the serverside to handle. In the generated instructions it says { "Caption: This is how we build a castle in the Anterctica" , "Size: 1280 x 720 px", "filter: Cool", etc} which calls the components (packages like sharp, jimp to handle). And it do the edit. and show them to the user in the preview section. this is a broad way to think about the project


so how can I automate this using gemini. so that it can give instructions and call the components to work by itself.

also do some prompt engineering of gemini output. give me a prompt that will work for the gemini so that it can generate the expected json output for the components to understand


Please give me architacture of how can we build such system. 
and intstructions in PRD.  And To create step by step state methodolgies that will work for sure in successful building this app
```

```
Add custom font support?
Add more effects (like emoji support, stickers, or shapes)?
Create more thumbnail templates?
```


```
Core Image Processing:
sharp (already installed): For basic operations, resizing, and format conversion
canvas or node-canvas: For advanced text effects, gradients, and overlays

Effects and Filters:
@jimp/plugins: For Instagram-style filters
tinycolor2: For advanced color manipulation
chroma-js: For color gradients and schemes

Text and Typography:
opentype.js: For custom font handling
fontkit: For advanced font features
text-to-svg: For creating text effects

Design Elements:
svg.js: For vector graphics and shapes
fabric.js: For canvas manipulation and layering
```