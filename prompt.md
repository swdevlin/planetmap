Create a nodejs web service that creates SVGs of planets for the Traveller RPG from a JSON block of characteristics. The base rules for creating the map can be found in T5CRB3.PDF, starting on page 36. You can find a copy of ghostscript at  C:\Program Files\gs\gs10.08.0\bin\gswin64c.exe .

I am a Smalltalk developer. I think in terms of objects and messages, not functions. Please use objects in the code. And use JavaScript, not TypeScript. Single class per file is great.

Stop and ask me questions if you need clarification. Don't make assumptions.

log the calls, recording time to render and the size of the svg returned.

I am starting to doubt the value of unit tests for AI written code, but let's include them for old times sake.

The app will be blue/green deployed using docker.

Hexes have terrain type and features. The hexes should have a textured colour based on terrain type with the features drawn on top of that. Use colours that make sense.

The number of settlements is in the JSON. Use that to determine how many settlement to draw on the map. Use names if provided, or Settlement 1, Settlement 2, etc, if not provided. Settlements have a type:  Cw world capital, Cf faction capital, Cn national capital or Cr regional capital. Use a different symbol for each type. If you need fontawesome svg for the icons let me know.

Settlements on tidally locked planets should be along/in the twilight zones.

Support a seed for the RNG. The seed will be passed in the X-Planet-Seed header. Use a random seed if one is not passed.

Display a legend at the bottom of the chart.

Pull the feature icons from the book.

---

Some changes from the base rules:

The rules use trade codes for determining some characteristics of the world. Use the planet's JSON data to determine that instead. Ask clarifying questions if you can't translate the trade codes to JSON.

A planet is tidally locked only if it is locked to a star.

The rules state 1 hex per planet size along the triangle edge. The minimum number of hexes should be 5. If the planet size is less than 5, still use 5 hexes but update the legend to say the hex is 800 (4), 600 (3), 400 (2), 200 (1) kms in size.

A planet can have an extinct sophont. Assume the planet has ruins in that instance.

Planets can have oceans with liquids other than water. Check the JSON for the type of liquid. Colour ocean hexes differently if the liquid is not water. Use the following for colours for the non-water liquids.

Sulfur dioxide #d9b38c
Sulfuric acid #d8d24a
Hydrochloric acid #e59aa8
Hydrofluoric acid #6fd0bd
Hydrogen cyanide #f7f2c4
Carbonic acid #9fb8c8
Formic acid #d4a5d9
Formamide #8f8fd0
Nitric acid #e07a3c
Sulfur #e6b422
Sodium #d8dce0
Fluorine #f0f080
Chlorine #8ec63f
Ammonia #b7d7a8
Ethane, alkane, propane, butane, hydrocarbon, petrol, oil #5f8f9a
Methane #b87333
Oxygen #8fc6ec
Nitrogen #dfe9f3
Carbon dioxide #c8c8d0

---

There are two target samples in the testdata folder. tidallocked is an example of a tidally locked planet. size6 is a sample size 6 planet. Your code should be able to produce those images. Note you don't need to reproduce them exactly (colours could be off, terrain distribution could be different) but they should look functionally the same. If you feel like the render is close, ask me to review your rendered svg against the original.
