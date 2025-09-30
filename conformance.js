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
    name: 'Basic VOD H.264 fMP4',
    manifest: '/content/mp4_h264_480p_1s/playlist.m3u8',
    description: 'A standard Video-On-Demand presentation using H.264 fragmented MP4 segments.'
  },
  {
    name: 'Basic VOD H.264 TS',
    manifest: '/content/ts_h264_480p_1s/playlist.m3u8',
    description: 'H.264 video using MPEG-TS segments for 1-second chunks.'
  },
  {
    name: 'Basic VOD H.265 TS',
    manifest: '/content/ts_h265_480p_1s/playlist.m3u8',
    description: 'H.265/HEVC video using MPEG-TS segments for 1-second chunks.'
  },
  {
    name: 'Basic VOD H.265 fMP4',
    manifest: '/content/mp4_h265_480p_1s/playlist.m3u8',
    description: 'H.265/HEVC video using fragmented MP4 segments for 1-second chunks.'
  },
  {
    name: 'Basic VOD VP9 fMP4',
    manifest: '/content/mp4_vp9_480p_1s/playlist.m3u8',
    description: 'VP9 video using fragmented MP4 segments for 1-second chunks.'
  },
  {
    name: 'Basic VOD AV1 fMP4',
    manifest: '/content/mp4_av1_480p_1s/playlist.m3u8',
    description: 'AV1 video using fragmented MP4 segments for 1-second chunks.'
  },
  {
    name: 'Basic VOD H.264 fMP4 No-Init',
    manifest: '/content/mp4_h264_480p_1s_noinit/playlist.m3u8',
    description: 'H.264 fragmented MP4 segments without a separate init segment.',
    expected: 'fail'
  },
  {
    name: 'Multivariant fMP4 H.264',
    manifest: '/manifests/mp4_h264_multiresolution/playlist.m3u8',
    description: 'A multivariant playlist with 480p and 720p fMP4 H.264 streams.'
  },
  {
    name: 'Multivariant TS H.264',
    manifest: '/manifests/ts_h264_multiresolution/playlist.m3u8',
    description: 'A multivariant playlist with 480p and 720p TS H.264 streams.'
  },
  {
    name: 'Quirk: No comma on EXTINF',
    manifest: '/content/quirk_extinfcomma/playlist.m3u8',
    description: 'A playlist where #EXTINF lines do not have a trailing comma, which is a spec violation.',
  },
  {
    name: 'Quirk: #EXT-X-ENDLIST in multivariant playlist',
    manifest: '/manifests/quirk_endlist_in_multivariant/playlist.m3u8',
    description: 'A multivariant playlist with a trailing #EXT-X-ENDLIST tag, which is a spec violation.',
  },
  {
    name: 'Quirk: Duplicate rendition names',
    manifest: '/manifests/quirk_duplicate_rendition_names/playlist.m3u8',
    description: 'A multivariant playlist with duplicate NAME attributes in #EXT-X-MEDIA tags.',
  },
  {
    name: 'Quirk: Multiple default renditions',
    manifest: '/manifests/quirk_multiple_default_renditions/playlist.m3u8',
    description: 'A multivariant playlist with multiple renditions in the same group set to DEFAULT=YES.',
  },
  {
    name: 'Encrypted H.264 TS',
    manifest: '/content/ts_h264_480p_1s_encrypted/playlist.m3u8',
    description: 'AES-128 encrypted H.264 video using MPEG-TS segments.'
  },
];
