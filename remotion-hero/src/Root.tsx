import { Composition } from "remotion";
import { HeroVideo } from "./HeroVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeroVideo"
        component={HeroVideo}
        durationInFrames={420} // 14 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HeroVideoSquare"
        component={HeroVideo}
        durationInFrames={420}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="HeroVideoShort"
        component={HeroVideo}
        durationInFrames={300} // 10 seconds
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
