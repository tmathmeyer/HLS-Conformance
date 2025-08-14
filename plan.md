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

16. **More variety**
    * Come up with more test cases for conformance. Anything you can think of. Make new entries in the conformance.js file, but don't create any manifests yet.
      - some ideas include encryption, different codecs, (aac, h265, h266)
    * Some of these things should be cases that _SHOULD_ fail, not just pass. You can tag these entries with some kind of expect failure label.
    * After you complete this step, I'll review your entries.
    * Aim for 20-40 new entries.

17. **Adding manifests for new tests**
    * Create manifests for each of the tests that don't have an entry.
    * Some of the manifests will need a new set of codecs or containers, and you should generate that as well, using content/orbit.mp4 as the media source file.
    * For Encrypted tests - there's a python script that might help in external/generate_hls.py. You probably don't want to use it directly, but there is a section on how to generate keys when keyinfo is not None. I suggest you take a similar approach.

18. **Polishing the turd**
    * First lets improve a few features:
      - Tests which are expected to fail should have a green "fail" status bar, not a red one. If a test which is expected to fail passes, it should be red, and marked "unepected non-failure".
      - You have "Logs" and "Network Requests" and "Screenshot" rendered for each test, lets also include every unique manifest that is loaded for each player.
      - Lets add a little thing in the title bar that shows total/passes/failed/running test counts, and updates whenever one of the tests changes state.
      - Lets add a little selector at the top which can toggle between "native", "hls.js", and "shakaplayer". It should default to "native" and right now the other two choices won't do anything except for pop up an alert saying "unimplemented".
    * There are a few bugs too:
      - Sometimes the screenshots don't work.
      - av1 and vp9 are expected failures.

19. **More Test Content**
    * The SAMPLE-AES content is still missing (unable to generate with ffmpeg)
    * Figure out how to generate some encrypted content for other key systems, like widevine. (unable to generate without a key server)
    * There are some good ideas for example tests on the apple site here: https://developer.apple.com/streaming/examples/. Use this to make 10 new tests that are unlike the other tests you've made, or if you can't make 10, tell me why.

20. **The Challenge**
    * Make each of the tests run in parallel. I suspect you might be able to do this with iframes so that each of the individual tests can't see eachother's network requests.

21. **HLS.js**
    * We now need to implement the "comparison" element of this project
    * You should download the latest version of hls.js to the vendor/ directory
    * When clicking on the "hls.js" button at the top of the page, it should run all the tests, but use HLS.js to load the manifests and create the player.

22. **Shaka Player**
    * You should download the latest version of shakaplayer into the vendor/ directory.
    * Similar to the HLS.js task, implement the shaka player version of all the tests, which
    will run when the user clicks the shaka player button at the top.

23. **Test runner improvement**
    * Instead of a toggle at the top of the page, each of the tests should automatically run under the native/hls.js/shaka implementations, and should have three pass/fail badges in associated columns.

24. **Features!**
    * The test results should have a button next to the pass/fail marker which will open just a runner for that test in a new tab. Since tests are run in an iframe, this should be easy.
    * Use the worker.js to cache the results of every network request. Right now there are a lot of requests hitting the webserver!
    * Capture logs from shaka player and hls.js and include them in the associated logs place.
    * Run more than 5 tests at once. Maybe 20 is appropriate.
    * Come up with 3 new features that you think I might want, and I'll let you know if they are good enough. If they are, add them to this task, and implement them.

25. **Timeline View**
    * Create a visual timeline that shows the sequence of network requests, player events, and logs for each test. This would help visualize the playback process and identify timing-related problems.

26. **Custom Test Manifests**
    * Allow users to paste in their own manifest URL or upload a manifest file to run the conformance tests against. This would make the tool more flexible for testing custom content.

27. **Test Filtering**
    * Add a search box above the test results that allows the user to filter which tests are run. For example, typing "encryption" would only run tests with "encryption" in their name or description. This will make it easier to focus on specific areas of HLS support.