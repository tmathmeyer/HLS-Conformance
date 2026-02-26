# HLS Conformance suite tools and rules

## Dev Environment Rules
 - This site is, and must remain entirely statically served. It is served via
   github pages in production, and for testing can be served locally via a
   python simple http server commandline in the root directory.
 - This project is *almost* entirely library-free. In order to minimize the
   surface for unexpected behavior, we want to use no js libraries aside from
   the player libraries (like hls.js, shaka, video.js). Additionally, html is
   to be specified in a very basic, simple, human-readable fasion. There are
   to be no generated files.
 - There should be no media loaded from other URLs or websites.
 - All code is to be formatted using two-space indentation.

## Testing Instructions
 - This site itself is a test for chromium and assorted JS libraries, and as
   such, there are not any unit tests or integration tests.
 - Prior to submitting a patch, if a VM capable of running chrome is avalable,
   the site should be loaded, the 'Run All' button should be clicked, and the
   reports should be provided as a markdown table in the CL (Change List -
   sometimes called a PR or CR by the less technically inclined)

