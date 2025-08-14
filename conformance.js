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
    name: 'Basic VOD (TS)',
    manifest: '/manifests/basic-vod-ts.m3u8',
    description: 'A standard Video-On-Demand presentation using MPEG-2 Transport Stream segments.'
  },
  {
    name: 'Basic VOD (fMP4)',
    manifest: '/manifests/basic-vod-fmp4.m3u8',
    description: 'A standard Video-On-Demand presentation using fragmented MP4 segments.'
  },
  {
    name: 'Quirk: ENDLIST in Multivariant Playlist',
    manifest: '/manifests/quirk-endlist-in-multivariant.m3u8',
    description: 'A multivariant playlist with a trailing EXT-X-ENDLIST tag, which is a spec violation.'
  },
  {
    name: 'Quirk: Duplicate Rendition Names',
    manifest: '/manifests/quirk-duplicate-rendition-names.m3u8',
    description: 'A manifest with multiple audio renditions in the same group using the same NAME attribute.'
  },
  {
    name: 'Quirk: Multiple Default Renditions',
    manifest: '/manifests/quirk-multiple-default-renditions.m3u8',
    description: 'A manifest with multiple audio renditions in the same group marked as DEFAULT=YES.'
  },
  {
    name: 'Quirk: Missing EXTINF Comma',
    manifest: '/manifests/quirk-missing-extinf-comma.m3u8',
    description: 'A media playlist where an EXTINF tag is missing its trailing comma.'
  },
  {
    name: 'HEVC/H.265 VOD',
    manifest: '/manifests/vod-hevc.m3u8',
    description: 'A VOD presentation using HEVC (H.265) codec.'
  },
  {
    name: 'VP9 VOD',
    manifest: '/manifests/vod-vp9.m3u8',
    description: 'A VOD presentation using VP9 codec in an MP4 container.',
    expected: 'fail'
  },
  {
    name: 'AV1 VOD',
    manifest: '/manifests/vod-av1.m3u8',
    description: 'A VOD presentation using AV1 codec.',
    expected: 'fail'
  },
  {
    name: 'AES-128 Encrypted VOD',
    manifest: '/manifests/vod-aes128.m3u8',
    description: 'A VOD presentation encrypted with AES-128.'
  },
  {
    name: 'SAMPLE-AES Encrypted VOD',
    manifest: '/manifests/vod-sample-aes.m3u8',
    description: 'A VOD presentation encrypted with SAMPLE-AES.'
  },
  {
    name: 'Audio-Only VOD',
    manifest: '/manifests/vod-audio-only.m3u8',
    description: 'A VOD presentation with only an audio track.'
  },
  {
    name: 'Video-Only VOD',
    manifest: '/manifests/vod-video-only.m3u8',
    description: 'A VOD presentation with only a video track.'
  },
  {
    name: 'Alternate Audio Renditions',
    manifest: '/manifests/vod-alternate-audio.m3u8',
    description: 'A VOD with multiple selectable audio tracks (e.g., different languages).'
  },
  {
    name: 'Alternate Video Renditions (Bitrate)',
    manifest: '/manifests/vod-alternate-video.m3u8',
    description: 'A multivariant playlist with multiple video renditions at different bitrates.'
  },
  {
    name: 'I-Frame Stream',
    manifest: '/manifests/vod-iframe-stream.m3u8',
    description: 'A VOD with an I-frame only stream for fast seeking.'
  },
  {
    name: 'Subtitles (WebVTT)',
    manifest: '/manifests/vod-webvtt.m3u8',
    description: 'A VOD with WebVTT subtitles.'
  },
  {
    name: 'Discontinuity',
    manifest: '/manifests/vod-discontinuity.m3u8',
    description: 'A VOD with a discontinuity tag between segments.'
  },
  {
    name: 'BYTERANGE Support',
    manifest: '/manifests/vod-byterange.m3u8',
    description: 'A VOD using BYTERANGE requests to seek within a single file.'
  },
  {
    name: 'Invalid Segment URI',
    manifest: '/manifests/fail-invalid-segment-uri.m3u8',
    description: 'A media playlist pointing to a segment that does not exist.',
    expected: 'fail'
  },
  {
    name: 'Mismatched Target Duration',
    manifest: '/manifests/fail-mismatched-target-duration.m3u8',
    description: 'A media playlist where a segment duration exceeds the target duration.',
    expected: 'fail'
  },
  {
    name: 'Missing Endlist Tag (VOD)',
    manifest: '/manifests/fail-missing-endlist.m3u8',
    description: 'A VOD playlist that is missing the EXT-X-ENDLIST tag.',
    expected: 'fail'
  },
  {
    name: 'Corrupted Segment',
    manifest: '/manifests/fail-corrupted-segment.m3u8',
    description: 'A media playlist with a link to a corrupted media segment.',
    expected: 'fail'
  },
  {
    name: 'Unsupported Codec',
    manifest: '/manifests/fail-unsupported-codec.m3u8',
    description: 'A manifest declaring a codec string that is not supported by the platform.',
    expected: 'fail'
  },
  {
    name: 'Cross-protocol Redirect',
    manifest: '/manifests/fail-cross-protocol-redirect.m3u8',
    description: 'A manifest that redirects from HTTPS to HTTP.',
    expected: 'fail'
  }
];
