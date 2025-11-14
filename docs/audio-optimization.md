# Audio Optimization Guide

## Current Implementation

The audio file is optimized for fast loading using progressive/streaming techniques:

1. **Progressive Loading**: Audio loads metadata first, then buffers progressively
2. **Service Worker Caching**: Audio is cached for offline use
3. **Range Request Support**: Supports partial content requests for faster initial playback

## Compression Recommendations

### 1. Audio Compression Tools

#### Using FFmpeg (Recommended)
```bash
# Compress AAC audio with lower bitrate (64kbps for background music)
ffmpeg -i input.wav -c:a aac -b:a 64k -ar 44100 -ac 2 output.aac

# Even more aggressive compression (48kbps)
ffmpeg -i input.wav -c:a aac -b:a 48k -ar 44100 -ac 2 output.aac

# For mono audio (smaller file size)
ffmpeg -i input.wav -c:a aac -b:a 48k -ar 44100 -ac 1 output.aac
```

#### Using Audacity
1. Open your audio file
2. File → Export → Export as AAC
3. Set quality to 64kbps or lower for background music
4. Use 44.1kHz sample rate
5. Consider mono instead of stereo

### 2. Optimal Settings for Background Music

- **Bitrate**: 48-64 kbps (sufficient for background music)
- **Sample Rate**: 44.1 kHz (standard)
- **Channels**: Mono (1 channel) if possible, or Stereo (2 channels)
- **Format**: AAC (.aac or .m4a)
- **Duration**: Keep it short if looping (30-60 seconds ideal)

### 3. File Size Targets

- **Target**: < 500KB for 1 minute of audio
- **With 64kbps**: ~480KB per minute
- **With 48kbps**: ~360KB per minute
- **With 32kbps**: ~240KB per minute (may affect quality)

### 4. Additional Optimization Techniques

#### Create a Shorter Loop
If your audio is long, create a seamless 30-60 second loop:
```bash
# Extract and loop first 30 seconds
ffmpeg -i input.wav -t 30 -c:a aac -b:a 64k loop.aac
```

#### Use Web Audio API for Dynamic Compression (Advanced)
For runtime compression, you could use Web Audio API, but this is more complex.

## Server-Side Optimization

### 1. Enable Gzip/Brotli Compression
Ensure your server compresses audio files:
- **Gzip**: Good for text, less effective for binary
- **Brotli**: Better compression, supported by modern browsers

### 2. HTTP/2 Server Push
Push audio file when HTML loads (if using HTTP/2)

### 3. CDN Configuration
- Enable compression
- Set proper cache headers
- Use HTTP/2 or HTTP/3

## Current Progressive Loading Strategy

The implementation uses:

1. **Metadata-first loading**: `preload='metadata'` loads file info first
2. **Progressive buffering**: After metadata, switches to `preload='auto'`
3. **Range request support**: Service worker supports partial content requests
4. **Early preloading**: Audio starts loading on page load

## Testing Compression

After compressing, test:
1. File size reduction
2. Audio quality (should still sound good)
3. Loading time (should be faster)
4. Playback smoothness

## Example Compression Commands

```bash
# High quality (recommended for background music)
ffmpeg -i sunset-in-bali-audio.wav -c:a aac -b:a 64k -ar 44100 -ac 2 sunset-in-bali-audio.aac

# Smaller file (if quality is acceptable)
ffmpeg -i sunset-in-bali-audio.wav -c:a aac -b:a 48k -ar 44100 -ac 1 sunset-in-bali-audio.aac

# Very small (test quality first)
ffmpeg -i sunset-in-bali-audio.wav -c:a aac -b:a 32k -ar 44100 -ac 1 sunset-in-bali-audio.aac
```

## Next Steps

1. Compress your audio file using FFmpeg with 48-64kbps bitrate
2. Replace the file in `/public/stories-asset/main/`
3. Test the loading speed
4. Adjust bitrate if quality is not acceptable

