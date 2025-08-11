export const mimeTypes = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'application/x-mpegURL',
  'application/vnd.apple.mpegurl',
];

export const codecStrings = [
  // Common H.264 (AVC)
  'avc1.42c01e', // Baseline Profile, Level 3.0
  'avc1.4d401e', // Main Profile, Level 3.0
  'avc1.64001e', // High Profile, Level 3.0

  // Common H.265 (HEVC)
  'hvc1.1.6.L93.B0',
  'hev1.1.6.L93.B0',

  // Common AAC (Audio)
  'mp4a.40.2',  // AAC-LC
  'mp4a.40.5',  // HE-AAC

  // VP9
  'vp09.00.50.08',

  // AV1
  'av01.0.04M.08',
];

export const hlsFeatures = [
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
];

export const hlsQuirks = [
    {
        name: 'EXT-X-MEDIA with no URI',
        manifest: 'https://storage.googleapis.com/shaka-demo-assets/hls-live-layout-creator/live.m3u8',
        description: 'Some manifests have an EXT-X-MEDIA tag without a URI, which is a spec violation'
    }
]
