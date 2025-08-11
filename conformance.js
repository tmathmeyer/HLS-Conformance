export const mimeTypes = [
  'audio/aac',
  'video/mp4',
  'video/webm',
  'video/mp2t',
  'video/x-mpegURL',
  'video/vnd.apple.mpegurl',
  'application/x-mpegURL',
  'application/vnd.apple.mpegurl',
];

export const codecStrings = [
  // Common AAC (Audio)
  'mp4a.40',     // AAC indeterminate profile
  'mp4a.40.2',   // AAC-LC
  'mp4a.40.5',   // HE-AAC
  'mp4a.40.34',  // MP3
  'ec-3', // Dolby Digital Plus (Enhanced AC-3)

  // Common H.264 (AVC)
  'avc1',        // h264 indeterminate profile
  'avc1.42001e', // h264 baseline 3.0
  'avc1.66.30',
  'avc1.42c01e', // Baseline Profile, Level 3.0
  'avc1.4d401e', // Main Profile, Level 3.0
  'avc1.64001e', // High Profile, Level 3.0
  'avc1.42E01E', // h264 constrained 3.0
  'avc1.42001f', // h264 baseline 3.1
  'avc1.64001f', // h264 high 3.1
  'avc1.77.30',
  'avc1.4d0028', // h264 main 4.0
  'avc1.640028', // h264 high 4.0
  'avc1.640029', // h264 high 4.1

  // Common H.265 (HEVC)
  'hvc1.1.6.L93.B0',
  'hev1.1.6.L93.B0',
  'hev1.1.6.L150', // HEVC
	'hvc1.1.60000000.L123.B0', // HEVC

  // VP9
  'vp09.00.50.08',

  // AV1
  'av01.0.04M.08',
];

export const hlsConformanceTests = [
  {
    name: 'Basic VOD',
    manifest: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8',
    description: 'A standard Video-On-Demand presentation.'
  },
  {
    name: 'Live',
    manifest: 'https://storage.googleapis.com/shaka-demo-assets/hls-live-layout-creator/live.m3u8',
    description: 'A live event, the manifest will be updated periodically.'
  },
  {
    name: 'Encrypted Content (AES-128)',
    manifest: 'https://storage.googleapis.com/shaka-demo-assets/aes-128-hls/hls.m3u8',
    description: 'A stream encrypted with AES-128.'
  },
  {
    name: 'Trick Play (I-Frames Only)',
    manifest: 'https://storage.googleapis.com/shaka-demo-assets/sintel-hls-for-live-player/main.m3u8',
    description: 'Contains an I-Frame only playlist for fast-forward/rewind.'
  },
  {
    name: 'Quirk: EXT-X-MEDIA with no URI',
    manifest: 'https://storage.googleapis.com/shaka-demo-assets/hls-live-layout-creator/live.m3u8',
    description: 'Some manifests have an EXT-X-MEDIA tag without a URI, which is a spec violation'
  }
];
