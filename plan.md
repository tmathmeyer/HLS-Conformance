**HLS Conformance Tester - Detailed 20-Step Plan**

1.  **Initial HTML Document Setup**
    *   Create the `index.html` file.
    *   Add the standard HTML5 boilerplate (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`).
    *   Set the page title to "HLS Conformance Tester" in the `<head>`.

2.  **File Linking**
    *   Create an empty `style.css` file.
    *   Create an empty `main.js` file.
    *   Link `style.css` in the `<head>` of `index.html`.
    *   Link `main.js` at the end of the `<body>` in `index.html`, ensuring you use `<script type="module">`.

3.  **Semantic HTML Layout**
    *   In `index.html`, structure the `<body>` with semantic containers.
    *   Add a `<header>` with an `<h1>` for the page title.
    *   Add a `<main>` element that will hold the core application interface.
    *   Add a `<footer>` with some placeholder text (e.g., "HLS Conformance Tester").

4.  **Basic CSS Foundation and Reset**
    *   In `style.css`, add a simple CSS reset to normalize default browser styles.
    *   Define global variables for colors and fonts in the `:root`.
    *   Apply base styles to the `body`, such as setting a background color, text color, and a modern font stack (e.g., `system-ui`).

5.  **Primary Layout Styling**
    *   In `style.css`, use Flexbox or CSS Grid to structure the main layout.
    *   Make the `body` a flex column that takes up the full viewport height.
    *   Style the `<header>` and `<footer>` with distinct background colors and padding.
    *   Ensure the `<main>` element grows to fill the available space.

6. **Create some conformance lists**
    * In a new file `conformance.js`, lets make a couple of lists. The first list is one for mime types, and the second is for codec strings. These lists will be crossed and passed to MediaSource.isTypeSupported() as well as <video>.CanPlayType(), and presented in a grid view. 
    * In `conformance.js` again, lets make a list of HLS features, based on the specification here: https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis. This list should include things like encrypted content, live, vod, etc. each list entry should be an object including a display name, a manifest url, and a description. To this list we also want to add some tests for "quirky" behavior, which are things that are commonly found in real-life manifests, but violate the spec. A list of some quirks can be found here: /chromium/src/media/formats/hls/quirks.h

7. **Create a grid renderer web component**
    * This should support an X and Y axis list as well as a title. It should create the x-axis labels using vertical text and the y-axis labels using normal text (though both should use a fixed-width font).

8. **Render the codec support checks**
    * Using the grid renderer, load `mimeTypes` from `conformance.js` as the Y axis and `codecStrings` as the X axis. In the first grid, we will populate each cell with a color based on the results of `MediaSource.IsTypeSupported()`. If the result of that function is `true`, color the cell green. If the result is `false`, color the cell red. For the second grid, we will use `<video>.canPlayType()`. If the result is `probably`, color the cell green. If the result is `maybe`, color the cell yellow. For any other returned value, color the cell red. 

9.  **Pause for bug fixing**
    * The user will go over some bug that you'll need to address.

10. **Improve The Look**
    * There's a nice contrast on the page with the title bar "hovering" above the grey background.
    * Each of the conformance reports should have a similar feel, being contained in a box which similarly hovers over the background.
    * The conformance reports should be collapsable, and start in the collapsed state.
    * Each of the grids provided so far are separate conformance reports.

11. **Manifests Conformance**
    * Use the entries in `hlsConformanceTests` from `conformance.js`.
    * For each conformance run, do the following:
      - Make a video player in the background
      - Capture all JS logs happening related to this player
      - Set the video source to the manifest URL provided
      - Let the manifest load, and capture any errors that show up
      - Draw the video to canvas.
      - Generate a conformance report (a <details> and <summary> combination), which includes the captured logs, loaded files, and a screenshot of the video from the canvas.

12. **Generating Content**
    * Create a `content/` directory.
    * Use ffmpeg to create a media file in the `content/` directory which is just a red square orbiting the center in a clockwise direction. The video should be 360p, and play a differently pitched beep each time the square moves another 25% around it's orbit. This file should be such that playing it repeatedly on loop is smooth from the last frame to the first. It should take 10 seconds for the square to revolve around it's orbit.
    * Use ffmpeg to split this content into HLS content both in the MP4 format as well as the TS format. Segment lengths should be 2 seconds each.

13. **Network capture and injection**
    *   Now comes the fun part! We want to be able to intercept all the network requests that the HLS player is going to make. We want to do this for logging purposes as well as being able to tweak manifests on the fly.
    * We can use a webworker to do this, so lets build that.

14. **Reorganizing**
    * We're going to want to share media content between manifests now, so lets reorganize the HLS content directory.
      - Move the media files from content/ into content/[container]-[codec]/
      - Move the manifests from content/ into manifests/[testcase], but have them still point at the content/ media files.

15. **Quirky playback**
    * In the file "/chromium/src/media/formats/hls/quirks.h" I have listed a few issues that we see in real-life manifests that are actually spec violations. Lets add a conformance test for each of these.
    * Generate new manifests that exhibit these quirks in the manifests/ directory, and add new entried to conformance.js's hlsConformanceTests array.