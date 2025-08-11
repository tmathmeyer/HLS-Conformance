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

9.  **TBD**

10. **TBD**

11. **Native Player Implementation**
    *   In the form's submit listener, add the logic for the "Native" player.
    *   If the selected player is "Native", set the `<video>` element's `src` attribute directly to the manifest URL provided by the user.

12. **HLS.js Library Integration**
    *   Create a `vendor/` directory.
    *   Download the latest `hls.min.js` from its official CDN or repository and save it in `vendor/`.
    *   Add a `<script>` tag for `hls.min.js` to `index.html` before the `main.js` script tag.

13. **HLS.js Player Implementation**
    *   In `main.js`, write a dedicated function `loadWithHlsJs(url)`.
    *   This function will check if HLS.js is supported, create a new `Hls` instance, attach it to the video element, and load the source URL.

14. **Shaka Player Library Integration**
    *   Download the latest Shaka Player library (e.g., `shaka-player.ui.js` and its CSS) and save it in the `vendor/` directory.
    *   Add the necessary `<script>` and `<link>` tags for Shaka Player to `index.html`.

15. **Shaka Player Implementation**
    *   In `main.js`, write a dedicated function `loadWithShaka(url)`.
    *   This function will initialize a Shaka Player instance, attach it to the video element, and configure it to load the HLS manifest URL.

16. **Player Switching Logic**
    *   Refactor the form's submit listener in `main.js`.
    *   Use a `switch` statement or `if/else if` chain based on the selected player's value.
    *   Call the appropriate function (`loadWithHlsJs`, `loadWithShaka`, or the native implementation) based on the user's choice.

17. **Log Display Area**
    *   In `index.html`, add a `<div>` that will serve as a container for logs.
    *   In `style.css`, style this log container to be a fixed-height, scrollable box with a monospace font for readability.

18. **Event Logging Implementation**
    *   In `main.js`, create a generic `logEvent(event)` function that creates a new `<p>` tag with the event's type and appends it to the log container.
    *   Attach this logger to the most important `<video>` element events (e.g., `playing`, `pause`, `error`, `stalled`, `progress`, `loadedmetadata`).

19. **Web Component: Control Panel**
    *   Create a `components/` directory and a `ControlPanel.js` file inside it.
    *   Refactor the entire `<form>` (manifest input, player selection, and load button) into a self-contained `<control-panel>` Web Component.
    *   This component should emit a custom event with the form data when the load button is clicked.
    *   Update `index.html` and `main.js` to use this new component.

20. **Web Component: Log Viewer**
    *   Create a `components/LogViewer.js` file.
    *   Refactor the log display `<div>` and the logging logic into a `<log-viewer>` Web Component.
    *   The component should expose a public method like `log(message)` so that the main script can send new log entries to it.
    *   Update `main.js` to interact with the log viewer component.
