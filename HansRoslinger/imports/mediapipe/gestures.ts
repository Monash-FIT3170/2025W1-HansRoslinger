import { useEffect, useRef, useState, MutableRefObject } from "react";
import Webcam from "react-webcam";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import { GestureType, Handedness, Gesture } from "../gesture/gesture";
import { GestureHandler } from "../gesture/GestureHandler";

/*
Sample result from gestureRecognizer.recognizeForVideo(video, performance.now()) where one hand is detected
  "gestures":[[{"score":0.5793021321296692,"index":-1,"categoryName":"Open_Palm","displayName":""}]],
  "landmarks":[[{"x":0.7527955174446106,"y":1.2012784481048584,"z":6.468640094681177e-7,"visibility":0},{"x":0.6233795285224915,"y":1.11136794090271,"z":-0.03250322863459587,"visibility":0},{"x":0.5063647627830505,"y":0.9751449823379517,"z":-0.06595675647258759,"visibility":0},{"x":0.4027564525604248,"y":0.8998258113861084,"z":-0.10252699255943298,"visibility":0},{"x":0.3093261420726776,"y":0.8411229252815247,"z":-0.14604824781417847,"visibility":0},{"x":0.5989837646484375,"y":0.7041159272193909,"z":-0.05597049370408058,"visibility":0},{"x":0.5075109004974365,"y":0.5176438093185425,"z":-0.11227419972419739,"visibility":0},{"x":0.44604772329330444,"y":0.4067194163799286,"z":-0.15721137821674347,"visibility":0},{"x":0.39343345165252686,"y":0.3000783622264862,"z":-0.19210757315158844,"visibility":0},{"x":0.6775195002555847,"y":0.6706895232200623,"z":-0.08893915265798569,"visibility":0},{"x":0.626865804195404,"y":0.4174290597438812,"z":-0.14439460635185242,"visibility":0},{"x":0.5926821827888489,"y":0.2622970938682556,"z":-0.1934332549571991,"visibility":0},{"x":0.5609765648841858,"y":0.12528735399246216,"z":-0.22997424006462097,"visibility":0},{"x":0.7566919922828674,"y":0.7007327079772949,"z":-0.1271437257528305,"visibility":0},{"x":0.7465654611587524,"y":0.4562738835811615,"z":-0.1862000823020935,"visibility":0},{"x":0.7341155409812927,"y":0.3027615249156952,"z":-0.22868430614471436,"visibility":0},{"x":0.7165945172309875,"y":0.1629810333251953,"z":-0.258261114358902,"visibility":0},{"x":0.8336330652236938,"y":0.7746652364730835,"z":-0.16692638397216797,"visibility":0},{"x":0.8406203389167786,"y":0.5896760821342468,"z":-0.2182089388370514,"visibility":0},{"x":0.8419950008392334,"y":0.4606326222419739,"z":-0.24140146374702454,"visibility":0},{"x":0.8359396457672119,"y":0.3372325003147125,"z":-0.25887396931648254,"visibility":0}]],"worldLandmarks":[[{"x":0.01860933192074299,"y":0.08922401815652847,"z":0.018774697557091713,"visibility":0},{"x":-0.011693817563354969,"y":0.06966274231672287,"z":0.01550546009093523,"visibility":0},{"x":-0.0332338884472847,"y":0.052236367017030716,"z":0.015726571902632713,"visibility":0},{"x":-0.05923052132129669,"y":0.03215709328651428,"z":0.015724390745162964,"visibility":0},{"x":-0.07961700856685638,"y":0.01666589081287384,"z":0.022439880296587944,"visibility":0},{"x":-0.0265138428658247,"y":0.001515949610620737,"z":0.010746002197265625,"visibility":0},{"x":-0.0384933277964592,"y":-0.02636159397661686,"z":0.0054411739110946655,"visibility":0},{"x":-0.049741435796022415,"y":-0.04231458157300949,"z":-0.0020480207167565823,"visibility":0},{"x":-0.06432338058948517,"y":-0.05340070277452469,"z":-0.022783417254686356,"visibility":0},{"x":-0.004698723088949919,"y":-0.004306777846068144,"z":0.005629505030810833,"visibility":0},{"x":-0.011943681165575981,"y":-0.04342919588088989,"z":-0.003184114582836628,"visibility":0},{"x":-0.02164863795042038,"y":-0.06426350772380829,"z":-0.015340911224484444,"visibility":0},{"x":-0.03373923897743225,"y":-0.08278201520442963,"z":-0.028704505413770676,"visibility":0},{"x":0.016976475715637207,"y":-0.002227899618446827,"z":-0.007077543064951897,"visibility":0},{"x":0.013835413381457329,"y":-0.03274637460708618,"z":-0.016289198771119118,"visibility":0},{"x":0.008391330018639565,"y":-0.056045807898044586,"z":-0.02746330201625824,"visibility":0},{"x":0.0012106653302907944,"y":-0.07672137767076492,"z":-0.03517051041126251,"visibility":0},{"x":0.03045574016869068,"y":0.012825386598706245,"z":-0.015922170132398605,"visibility":0},{"x":0.03287796303629875,"y":-0.009963179007172585,"z":-0.02081241086125374,"visibility":0},{"x":0.02911839261651039,"y":-0.0314159169793129,"z":-0.029431572183966637,"visibility":0},{"x":0.023381972685456276,"y":-0.0492011159658432,"z":-0.038866788148880005,"visibility":0}]],"handedness":[[{"score":0.9588579535484314,"index":1,"categoryName":"Left","displayName":"Left"}]],"handednesses":[[{"score":0.9588579535484314,"index":1,"categoryName":"Left","displayName":"Left"}]]}     
*/

const GestureDetector = (
  videoRef: MutableRefObject<Webcam | null>,
  gestureDetectionStatus: boolean,
) => {
  // Gesture Constants
  const NUM_HANDS_DETECTABLE = 2; // Maximum number of hands that will be detected in a single recognition
  const MIN_HAND_DETECTION_CONFIDENCE = 0.6; // e.g., 0.6 means at least 60% confidence required
  const GESTURE_RECOGNITION_TIMEOUT_INTERVAL = 10; // in ms
  const SETUP_MAX_RETRIES = 5; // how many times to reattempt setting up mediapipe imports
  const SETUP_RETRY_DELAY = 1000; // in ms
  const VIDEO_HAS_ENOUGH_DATA = 4; // HTMLMediaElement.readyState, 4 = HAVE_ENOUGH_DATA which means media can be played long enough for gesture detection

  // React specific variables
  const [currentGestures, setCurrentGestures] = useState<Gesture[]>(
    Array(NUM_HANDS_DETECTABLE),
  );
  const [gestureRecognizer, setGestureRecognizer] =
    useState<GestureRecognizer | null>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { HandleGesture } = GestureHandler();

  // Helper function
  const cleanupInterval = () => {
    // Stop recursive interval call for next gesture detection
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Import gesture detection (mediapipe)
  useEffect(() => {
    const setup = async (retryCount = 0) => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        // import gesture detection with configuration constants
        const gestureRecognizerInternal =
          await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
            },
            runningMode: "VIDEO",
            numHands: NUM_HANDS_DETECTABLE,
            minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
          });

        setGestureRecognizer(gestureRecognizerInternal);
      } catch (error) {
        console.error(
          `GestureRecognizer setup failed (attempt ${retryCount + 1}):`,
          error,
        );
        if (retryCount < SETUP_MAX_RETRIES) {
          setTimeout(() => setup(retryCount + 1), SETUP_RETRY_DELAY);
        } else {
          console.error(
            "Failed to initialize GestureRecognizer after maximum of " +
              SETUP_MAX_RETRIES.toString() +
              " retries.",
          );
        }
      }
    };

    setup();

    return cleanupInterval;
  }, []);

  // Detect gestures
  useEffect(() => {
    if (gestureDetectionStatus) {
      const detectGesture = async () => {
        if (!gestureRecognizer || !videoRef || !videoRef.current) {
          return;
        }

        const processFrame = async () => {
          // This if statement is to handle any timeout interval that begins whilst gesturedetectionstatus is true but is actioned when gesturedetectionstatus is false
          if (gestureDetectionStatus) {
            if (!videoRef || !videoRef.current || !videoRef.current.video) {
              return;
            }
            const video = videoRef.current.video;
            if (video.readyState === VIDEO_HAS_ENOUGH_DATA) {
              const detectedGestures =
                await gestureRecognizer.recognizeForVideo(
                  video,
                  performance.now(),
                );
              const gestures: Gesture[] = Array(
                detectedGestures.gestures.length,
              );
              for (
                let index = 0;
                index < detectedGestures.gestures.length;
                index++
              ) {
                gestures[index] = {
                  gestureID: detectedGestures.gestures[index][0]
                    .categoryName as unknown as GestureType,
                  handedness: detectedGestures.handedness[index][0]
                    .categoryName as unknown as Handedness,
                  timestamp: new Date(),
                  confidence: detectedGestures.gestures[index][0].score,
                  landmarks: detectedGestures.landmarks[index],
                };
              }
              if (!(gestures.length == 0 && currentGestures.length == 0)) {
                setCurrentGestures(gestures);
              }
            }
          }
        };
        // Check gestures periodically
        intervalRef.current = setInterval(
          processFrame,
          GESTURE_RECOGNITION_TIMEOUT_INTERVAL,
        );
      };
      detectGesture();
    } else {
      cleanupInterval();
    }

    return cleanupInterval;
  }, [gestureRecognizer, gestureDetectionStatus]); // so that this function is called when gestureRecognizer has been correctly initialised

  // Handle newly detected gesture
  useEffect(() => {
    for (let index = 0; index < currentGestures.length; index++) {
      if (currentGestures[index]) {
        // Code to be called when new gestures are detected goes here
        HandleGesture(currentGestures[index]);
      }
    }
  }, [currentGestures]);
};

export default GestureDetector;
