import React, { useEffect, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

const GestureRecognizerComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gestureResult, setGestureResult] = useState("");
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const setup = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const gestureRecognizer = await GestureRecognizer.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
          },
          runningMode: "VIDEO",
          numHands: 1,
        }
      );

      gestureRecognizerRef.current = gestureRecognizer;

      // Start webcam
      if (videoRef.current) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            videoRef.current!.srcObject = stream;
            videoRef.current!.play();
          })
          .catch((err) => {
            console.error("Error accessing the webcam:", err);
          });
      }
    };

    setup();

    return () => {
      // Cleanup: Stop the video stream when the component unmounts
      if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const detectGesture = async () => {
      if (!gestureRecognizerRef.current || !videoRef.current) return;

      const recognizer = gestureRecognizerRef.current;

      const processFrame = async () => {
        const video = videoRef.current!;
        if (video.readyState === 4) {
          const result = await recognizer.recognizeForVideo(video, performance.now());
          setGestureResult(result["gestures"][0][0]["categoryName"]);
          if (
            result.gestures.length > 0 &&
            result.gestures[0].categories.length > 0
          ) {
            const gesture = result.gestures[0].categories[0].categoryName;
            setGestureResult(gesture);
          }
        }
      };

      // Check gestures periodically every 500ms
      intervalRef.current = setInterval(processFrame, 500);
    };

    detectGesture();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <video ref={videoRef} className="w-64 h-auto rounded-md shadow-lg" />
      <input
        type="text"
        value={gestureResult}
        readOnly
        className="p-2 border rounded shadow w-full"
        placeholder="Detected gesture will appear here"
      />
    </div>
  );
};

export default GestureRecognizerComponent;

{"gestures":[[{"score":0.7383038997650146,"index":-1,"categoryName":"Thumb_Up","displayName":""}]],
"landmarks":[[{"x":0.16300073266029358,"y":0.6686902642250061,"z":-6.086771122681967e-7,"visibility":0},{"x":0.21335171163082123,"y":0.45868462324142456,"z":-0.01241005677729845,"visibility":0},{"x":0.3170444965362549,"y":0.24198368191719055,"z":-0.035607580095529556,"visibility":0},{"x":0.390350878238678,"y":0.08134433627128601,"z":-0.05411326512694359,"visibility":0},{"x":0.42576903104782104,"y":-0.05129697918891907,"z":-0.06361890584230423,"visibility":0},{"x":0.3523544371128082,"y":0.23660264909267426,"z":-0.10322371870279312,"visibility":0},{"x":0.5537676215171814,"y":0.26038411259651184,"z":-0.1401589959859848,"visibility":0},{"x":0.522750973701477,"y":0.3096662163734436,"z":-0.1374630182981491,"visibility":0},{"x":0.4544866979122162,"y":0.32686758041381836,"z":-0.12824800610542297,"visibility":0},{"x":0.3816872537136078,"y":0.3831787407398224,"z":-0.11611046642065048,"visibility":0},{"x":0.5815674066543579,"y":0.38664770126342773,"z":-0.13690254092216492,"visibility":0},{"x":0.5309706330299377,"y":0.4263322353363037,"z":-0.1132141575217247,"visibility":0},{"x":0.4589313864707947,"y":0.44522494077682495,"z":-0.0988612249493599,"visibility":0},{"x":0.4124111831188202,"y":0.5361034274101257,"z":-0.1253090500831604,"visibility":0},{"x":0.5807521343231201,"y":0.5192687511444092,"z":-0.1333613097667694,"visibility":0},{"x":0.5266242623329163,"y":0.5480060577392578,"z":-0.09054102748632431,"visibility":0},{"x":0.46083247661590576,"y":0.5665601491928101,"z":-0.06609197705984116,"visibility":0},{"x":0.44001173973083496,"y":0.6800796389579773,"z":-0.1342800408601761,"visibility":0},{"x":0.5656136274337769,"y":0.6410661935806274,"z":-0.126674622297287,"visibility":0},{"x":0.5162399411201477,"y":0.6539491415023804,"z":-0.08769742399454117,"visibility":0},{"x":0.462054044008255,"y":0.6662575602531433,"z":-0.0622369647026062,"visibility":0}]],"worldLandmarks":[[{"x":-0.04811365157365799,"y":0.03588244318962097,"z":0.0645078644156456,"visibility":0},{"x":-0.028925560414791107,"y":0.004562383517622948,"z":0.05719686299562454,"visibility":0},{"x":-0.013037177734076977,"y":-0.01686413399875164,"z":0.0506124310195446,"visibility":0},{"x":-0.0018487721681594849,"y":-0.03685358911752701,"z":0.031730376183986664,"visibility":0},{"x":0.005116421729326248,"y":-0.06291038542985916,"z":0.015520020388066769,"visibility":0},{"x":-0.0059822965413331985,"y":-0.017924442887306213,"z":0.003312100190669298,"visibility":0},{"x":0.013410705141723156,"y":-0.013693539425730705,"z":0.009324840269982815,"visibility":0},{"x":0.01799536682665348,"y":-0.013062672689557076,"z":0.03739806264638901,"visibility":0},{"x":0.0008440902456641197,"y":-0.011855749413371086,"z":0.052039436995983124,"visibility":0},{"x":-0.002405152888968587,"y":-0.003319554729387164,"z":-0.0018454206874594092,"visibility":0},{"x":0.020788859575986862,"y":-0.004112293943762779,"z":-0.0006240620277822018,"visibility":0},{"x":0.015238886699080467,"y":-0.0022653574123978615,"z":0.025942189618945122,"visibility":0},{"x":0.004992122296243906,"y":-0.0007359059527516365,"z":0.04398258030414581,"visibility":0},{"x":0.005697366315871477,"y":0.009958538226783276,"z":-0.0036865666043013334,"visibility":0},{"x":0.022566920146346092,"y":0.00909487809985876,"z":0.00400910060852766,"visibility":0},{"x":0.018605615943670273,"y":0.010817250236868858,"z":0.025875547900795937,"visibility":0},{"x":0.010292325168848038,"y":0.012210964225232601,"z":0.04184334725141525,"visibility":0},{"x":0.004608185030519962,"y":0.02370649389922619,"z":0.004434362519532442,"visibility":0},{"x":0.02032409980893135,"y":0.020433291792869568,"z":0.008553623221814632,"visibility":0},{"x":0.01995425671339035,"y":0.02004501409828663,"z":0.028250791132450104,"visibility":0},{"x":0.008298507891595364,"y":0.022974690422415733,"z":0.03905380517244339,"visibility":0}]],"handedness":[[{"score":0.9945691823959351,"index":0,"categoryName":"Right","displayName":"Right"}]],"handednesses":[[{"score":0.9945691823959351,"index":0,"categoryName":"Right","displayName":"Right"}]]}
