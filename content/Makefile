SRC=src.mp4
SRC_720P=src_720p.mp4

.PHONY: all clean

GENERATED=ts_h264_480p_1s mp4_h264_480p_1s mp4_h264_480p_1s_noinit ts_h265_480p_1s \
          mp4_h265_480p_1s mp4_vp9_480p_1s mp4_av1_480p_1s ts_h264_720p_1s mp4_h264_720p_1s

all: $(GENERATED)
	@echo "Built all non-phony targets: $(GENERATED)"

clean:
	@echo "Cleaning non-phony targets..."
	@for t in $(GENERATED); do \
		if [ -e "$$t" ]; then \
			echo "rm -rf $$t"; rm -rf "$$t"; \
		fi \
	done

$(SRC):
	ffmpeg -f lavfi -i testsrc=duration=10:size=640x480:rate=30 -vf \
	"drawtext=fontcolor=black:fontsize=80:x=-50:y=200:text='%{pts\:hms}'" \
	-c:v libx264 -preset fast -g 30 -keyint_min 30 -sc_threshold 0 \
	-force_key_frames "expr:gte(t,n_forced*1)" -t 10 $@

$(SRC_720P):
	ffmpeg -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -vf \
	"drawtext=fontcolor=black:fontsize=80:x=-50:y=200:text='%{pts\:hms}'" \
	-c:v libx264 -preset fast -g 30 -keyint_min 30 -sc_threshold 0 \
	-force_key_frames "expr:gte(t,n_forced*1)" -t 10 $@

ts_h264_480p_1s: $(SRC)
	mkdir -p $@
	ffmpeg -i $(SRC) -c copy -start_number 0 -f hls -hls_time 1 \
	-hls_list_size 0 -hls_segment_filename "$@/out_%03d.ts" $@/playlist.m3u8

mp4_h264_480p_1s: $(SRC)
	mkdir -p $@ && \
	ffmpeg -i $(SRC) -c:v copy -c:a copy -f hls \
	-hls_time 1 -hls_list_size 0 -hls_segment_type fmp4 \
	-hls_segment_filename "$@/seg_%03d.mp4" $@/playlist.m3u8

ts_h264_720p_1s: $(SRC_720P)
	mkdir -p $@
	ffmpeg -i $(SRC_720P) -c copy -start_number 0 -f hls -hls_time 1 \
	-hls_list_size 0 -hls_segment_filename "$@/out_%03d.ts" $@/playlist.m3u8

mp4_h264_720p_1s: $(SRC_720P)
	mkdir -p $@ && \
	ffmpeg -i $(SRC_720P) -c:v copy -c:a copy -f hls \
	-hls_time 1 -hls_list_size 0 -hls_segment_type fmp4 \
	-hls_segment_filename "$@/seg_%03d.mp4" $@/playlist.m3u8

mp4_h264_480p_1s_noinit: $(SRC) mp4_h264_480p_1s
	mkdir -p $@ && \
	ffmpeg -i src.mp4 -c:v copy -c:a copy -f segment -segment_time 1 \
	-reset_timestamps 1 $@/seg_%03d.mp4 && \
	cp mp4_h264_480p_1s/playlist.m3u8 ./$@/ && \
	sed -i '/^#EXT-X-MAP:/d' $@/playlist.m3u8

ts_h265_480p_1s: $(SRC)
	mkdir -p $@ && ffmpeg -i $(SRC) -c:v libx265 -preset fast -c:a copy \
	-start_number 0 -f hls -hls_time 1 -hls_list_size 0 \
	-hls_segment_filename "$@/out_%03d.ts" $@/playlist.m3u8

mp4_h265_480p_1s: $(SRC)
	mkdir -p $@ && ffmpeg -i $(SRC) -c:v libx265 -preset fast -c:a copy \
	-f hls -hls_time 1 -hls_list_size 0 -hls_segment_type fmp4 \
	-hls_segment_filename "$@/seg_%03d.mp4" $@/playlist.m3u8

mp4_vp9_480p_1s: $(SRC)
	mkdir -p $@ && ffmpeg -i $(SRC) -c:v libvpx-vp9 -b:v 1M -c:a copy \
	-f hls -hls_time 1 -hls_list_size 0 -hls_segment_type fmp4 \
	-hls_segment_filename "$@/seg_%03d.mp4" $@/playlist.m3u8

mp4_av1_480p_1s: $(SRC)
	mkdir -p $@ && ffmpeg -i $(SRC) -c:v libaom-av1 -b:v 1M -c:a copy \
	-f hls -hls_time 1 -hls_list_size 0 -hls_segment_type fmp4 \
	-hls_segment_filename "$@/seg_%03d.mp4" $@/playlist.m3u8
