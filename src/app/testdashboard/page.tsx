import React from "react";

export default function Component() {
  return (
    <>
      <section id="page-layout-content" className="flex flex-1 flex-col">
        <div
          id="navbar"
          className="sticky top-0 z-navbar h-navbar flex items-center pl-5 pr-3 tablet:px-10 bg-global-background"
        >
          <a
            className="clip-right-[110px] tablet:hidden"
            href="https://playground.twelvelabs.io/"
          >
            <svg
              className="w-[160px]"
              fill="none"
              viewBox="0 0 180 36"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                height="2.144"
                width="15.8"
                fill="#1D1C1B"
                rx="0.629"
                x="10.777"
                y="12.354"
              />
              <rect
                height="2.144"
                width="8.666"
                fill="#1D1C1B"
                rx="0.629"
                y="12.354"
              />
              <rect
                height="2.144"
                width="9.894"
                fill="#1D1C1B"
                rx="0.629"
                x="30.508"
                y="12.354"
              />
              <rect
                height="2.144"
                width="8.476"
                fill="#1D1C1B"
                rx="0.629"
                x="31.926"
                y="9.282"
              />
              <rect
                height="2.144"
                width="6.721"
                fill="#1D1C1B"
                rx="0.629"
                x="41.516"
                y="9.282"
              />
              <rect
                height="2.144"
                width="7.651"
                fill="#1D1C1B"
                rx="0.629"
                x="38.652"
                y="6.143"
              />
              <rect
                height="2.144"
                width="2.251"
                fill="#1D1C1B"
                rx="0.629"
                x="41.076"
                y="3.072"
              />
              <rect
                height="2.144"
                width="3.896"
                fill="#1D1C1B"
                rx="0.629"
                x="18.258"
                y="27.713"
              />
              <rect
                height="2.144"
                width="2.553"
                fill="#1D1C1B"
                rx="0.629"
                x="25.023"
                y="27.713"
              />
              <rect
                height="2.144"
                width="6.884"
                fill="#1D1C1B"
                rx="0.629"
                x="28.754"
                y="27.713"
              />
              <rect
                height="2.144"
                width="2.858"
                fill="#1D1C1B"
                rx="0.629"
                x="32.203"
                y="24.641"
              />
              <rect
                height="2.144"
                width="2.251"
                fill="#1D1C1B"
                rx="0.629"
                x="12.889"
                y="27.713"
              />
              <rect
                height="2.144"
                width="2.251"
                fill="#1D1C1B"
                rx="0.629"
                x="23.279"
                y="30.784"
              />
              <rect
                height="2.144"
                width="2.144"
                fill="#1D1C1B"
                rx="0.629"
                x="21.082"
                y="33.856"
              />
              <rect
                height="2.144"
                width="2.79"
                fill="#1D1C1B"
                rx="0.629"
                x="29.588"
              />
              <rect
                height="2.144"
                width="7.137"
                fill="#1D1C1B"
                rx="0.629"
                x="13.717"
                y="9.282"
              />
              <rect
                height="2.144"
                width="4.335"
                fill="#1D1C1B"
                rx="0.629"
                x="26.949"
                y="3.072"
              />
              <rect
                height="2.144"
                width="6.996"
                fill="#1D1C1B"
                rx="0.629"
                x="24.289"
                y="6.143"
              />
              <rect
                height="2.144"
                width="4.082"
                fill="#1D1C1B"
                rx="0.629"
                x="46.051"
                y="12.354"
              />
              <rect
                height="2.144"
                width="20.167"
                fill="#1D1C1B"
                rx="0.629"
                x="7.521"
                y="15.426"
              />
              <rect
                height="2.144"
                width="7.879"
                fill="#1D1C1B"
                rx="0.629"
                x="25.828"
                y="21.569"
              />
              <rect
                height="2.144"
                width="25.621"
                fill="#1D1C1B"
                rx="0.629"
                x="10.777"
                y="18.498"
              />
              <rect
                height="2.144"
                width="9.525"
                fill="#1D1C1B"
                rx="0.629"
                x="6.855"
                y="21.569"
              />
              <rect
                height="2.144"
                width="3.125"
                fill="#1D1C1B"
                rx="0.629"
                x="15.553"
                y="24.641"
              />
              <rect
                height="2.144"
                width="3.364"
                fill="#1D1C1B"
                rx="0.629"
                x="26.578"
                y="24.641"
              />
              <rect
                height="2.144"
                width="3.158"
                fill="#1D1C1B"
                rx="0.629"
                x="9.785"
                y="24.641"
              />
              <rect
                height="2.144"
                width="8.145"
                fill="#1D1C1B"
                rx="0.629"
                x="30.508"
                y="15.426"
              />
              <rect
                height="2.144"
                width="2.251"
                fill="#1D1C1B"
                rx="0.629"
                x="32.4"
                y="6.12"
              />
              <path
                d="M174.4 27.095c-3.944 0-5.049-2.1-5.028-3.851.006-.438.285-.657.728-.657h.788c.454 0 .651.24.695.695.114 1.083.826 1.75 2.79 1.75 2.013 0 2.91-.716 2.91-1.821 0-.974-.553-1.33-1.926-1.565l-2.363-.405c-1.98-.339-3.293-1.455-3.293-3.457 0-2.254 1.674-3.906 4.77-3.906 3.206 0 4.874 1.68 4.847 3.638-.005.432-.295.65-.733.65h-.799c-.454 0-.618-.24-.684-.683-.114-.815-.782-1.56-2.631-1.56-1.838 0-2.56.778-2.56 1.784 0 .87.503 1.253 1.761 1.477l2.364.416c2.046.361 3.468 1.362 3.468 3.507 0 2.002-1.209 3.988-5.104 3.988M158.484 26.088c0 .454-.246.7-.7.7h-.826c-.454 0-.7-.246-.7-.7V9.982c0-.454.246-.7.7-.7h.832c.454 0 .7.246.7.7v5.772c.738-1.154 2.062-1.876 3.758-1.876 3.239 0 5.695 2.565 5.695 6.608s-2.456 6.609-5.695 6.609c-1.701 0-3.025-.722-3.764-1.882zm7.205-5.602c0-2.916-1.668-4.53-3.654-4.53s-3.676 1.614-3.676 4.53 1.69 4.53 3.676 4.53 3.654-1.614 3.654-4.53M148.637 13.878c3.392 0 4.93 1.608 4.924 4.207l-.011 4.797c0 .92.033 2.238.153 3.157.06.476-.142.75-.623.75h-.744c-.433 0-.679-.165-.723-.498l-.125-.947c-.668 1.1-1.975 1.663-3.578 1.663-2.894 0-4.678-1.707-4.678-4.032 0-2.035 1.434-3.288 3.874-3.463l3.561-.251c.646-.044.673-.104.673-.706v-.53c0-1.401-.848-2.112-2.703-2.112-1.81 0-2.615.695-2.691 1.668-.033.46-.192.706-.657.706h-.853c-.443 0-.722-.224-.728-.662-.016-2.046 1.488-3.747 4.929-3.747m-3.151 9.12c0 1.225 1.001 2.105 2.708 2.105 1.997 0 3.146-1.203 3.146-3.008v-1.187a4 4 0 0 1-.93.191l-3.118.295c-1.138.11-1.806.548-1.806 1.603M132.531 26.788c-.454 0-.7-.246-.7-.7V9.982c0-.454.246-.7.7-.7h.876c.454 0 .7.246.7.7v14.65h7.856c.454 0 .7.247.7.701v.755c0 .454-.246.7-.7.7zM124.156 27.095c-3.654 0-6.099-2.604-6.099-6.69 0-4.044 2.407-6.527 5.892-6.527 3.528 0 5.722 2.538 5.722 6.143v.268c0 .454-.246.7-.7.7h-8.66c.191 2.512 1.635 4.032 3.845 4.032 1.538 0 2.473-.601 2.851-1.652.142-.4.35-.607.771-.607h.804c.471 0 .75.263.668.728-.367 2.133-2.358 3.605-5.094 3.605m-3.758-7.993h7.003c-.258-2.024-1.505-3.266-3.452-3.266-1.888 0-3.179 1.215-3.551 3.266M110.977 26.788c-.405 0-.656-.175-.804-.552l-4.125-10.903c-.131-.34-.137-.575-.016-.816.115-.23.344-.333.738-.333h.613c.405 0 .662.175.804.558l3.354 9.016.186.58.186-.58 3.353-9.016c.142-.383.4-.558.804-.558h.613c.394 0 .624.104.739.334.12.24.114.475-.017.815l-4.125 10.903c-.147.377-.399.552-.804.552zM102.189 9.982c0-.454.247-.7.701-.7h.831c.454 0 .7.246.7.7v16.106c0 .454-.246.7-.7.7h-.831c-.454 0-.701-.246-.701-.7zM94.662 27.095c-3.654 0-6.1-2.604-6.1-6.69 0-4.044 2.408-6.527 5.892-6.527 3.529 0 5.723 2.538 5.723 6.143v.268c0 .454-.246.7-.7.7h-8.66c.19 2.512 1.635 4.032 3.845 4.032 1.538 0 2.473-.601 2.85-1.652.143-.4.35-.607.772-.607h.804c.47 0 .75.263.668.728-.367 2.133-2.358 3.605-5.094 3.605m-3.758-7.993h7.002c-.257-2.024-1.504-3.266-3.452-3.266-1.887 0-3.178 1.215-3.55 3.266M73.488 26.788c-.41 0-.667-.186-.787-.58l-3.37-10.892c-.11-.344-.104-.574.01-.81.116-.224.34-.322.734-.322h.623c.416 0 .668.186.788.585l2.736 9.043.049.219.049-.23 2.812-9.037c.12-.394.377-.58.788-.58h1.269c.41 0 .667.186.788.58l2.812 9.037.054.247.055-.241 2.735-9.038c.12-.4.372-.585.788-.585h.613c.394 0 .618.098.733.323.115.235.12.465.01.81l-3.37 10.891c-.12.394-.377.58-.787.58h-1.406c-.41 0-.667-.186-.788-.58l-2.806-9.037-.071-.285-.071.285-2.801 9.037c-.126.394-.383.58-.794.58z"
                fill="#1D1C1B"
              />
              <path
                d="M59.68 11.427c-.453 0-.7-.246-.7-.7v-.745c0-.454.247-.7.7-.7h11.965c.454 0 .7.246.7.7v.745c0 .454-.246.7-.7.7h-4.841v14.661c0 .454-.247.7-.7.7h-.876c-.454 0-.7-.246-.7-.7V11.427z"
                fill="#1D1C1B"
              />
            </svg>
          </a>
          <div className="flex items-center gap-x-2 tablet:gap-x-5 ml-auto h-full">
            <div className="flex items-center [&>.divider:only-child]:hidden">
              <a
                className="group text-body2 text-grey-500 hidden tablet:block mr-2"
                href="https://playground.twelvelabs.io/dashboard/usage"
              >
                Used 
                <span className="text-global-text group-hover:text-inherit">
                  0
                </span>
                 / 600 min
              </a>
              <button
                className="relative flex justify-center items-center transition-all capitalize disabled:bg-grey-100 disabled:text-grey-500 disabled:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.10)_inset] bg-transparent tablet:not-disabled:hover:bg-black/10 text-global-text shadow-[0px_0px_0px_1px_var(--color-grey-700)_inset] px-3 min-h-8 rounded-[9.6px] tablet:not-disabled:hover:rounded-[12px] text-body2 gap-x-1 mr-2"
                type="button"
              >
                Book A Demo
              </button>
              <button
                className="relative flex justify-center items-center transition-all capitalize disabled:bg-grey-100 disabled:text-grey-500 disabled:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.10)_inset] bg-transparent tablet:not-disabled:hover:bg-black/10 text-global-text shadow-[0px_0px_0px_1px_var(--color-grey-700)_inset] px-3 min-h-8 rounded-[9.6px] tablet:not-disabled:hover:rounded-[12px] text-body2 gap-x-1 mr-2"
                type="button"
              >
                Invite
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 9.833H4.667C3.47 9.833 2.5 10.803 2.5 12v2h-1v-2a3.167 3.167 0 0 1 3.167-3.166H10zm3.5.667h2v1h-2v2h-1v-2h-2v-1h2v-2h1zM8.001 2.666A2.667 2.667 0 1 1 7.999 8a2.667 2.667 0 0 1 .002-5.334m0 1.001a1.667 1.667 0 1 0 0 3.333 1.667 1.667 0 0 0 0-3.333"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <button type="button" aria-label="user-account-menu">
              <div className="flex items-center justify-center relative px-1 py-[3px] text-global-text bg-light-blue w-[52px] h-[28px] rounded-lg">
                <div className="text-body2">CH</div>
              </div>
            </button>
          </div>
        </div>
        <div className="pb-16 mx-auto w-full max-w-[1240px] px-0 tablet:px-10">
          <div className="flex flex-col w-full tablet:gap-y-5 tablet:pt-5">
            <div
              className="h-full w-full"
              style={{ opacity: 1, height: "auto" }}
            >
              <div
                className="flex items-center justify-between gap-x-2 px-3 py-2 styles_gradient__1SXho border-black/10 rounded-none tablet:rounded-lg"
                style={{
                  background:
                    "linear-gradient(90deg, rgb(233, 232, 231) 28.81%, rgba(233, 232, 231, 0) 103.14%), linear-gradient(270deg, rgb(246, 175, 255) -2.97%, rgb(255, 181, 146) 4.37%, rgb(250, 185, 32) 11.2%, rgb(132, 219, 26) 16.7%)",
                }}
              >
                <div className="flex flex-1 gap-x-2 items-center">
                  <span className="flex p-1 items-center h-[14px] rounded border-[0.5px] border-tl25-text">
                    <span className="text-tl25-text text-[8px] tracking-[0.64px]">
                      NEW
                    </span>
                  </span>
                  <div className="text-body2 text-grey-700 mr-auto">
                    Ã°Å¸Å½â€° TwelveLabs models are now in Amazon Bedrock! Leading
                    video understanding meets with the scale of AWS
                    infrastructure. Learn more 
                    <a
                      className="font-medium text-subtitle3 tablet:hover:underline text-link"
                      href="https://aws.amazon.com/bedrock/twelvelabs/"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      here
                    </a>
                     
                  </div>
                </div>
                <svg
                  className="h-4 w-4 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-y-14 pt-4 pb-4 tablet:py-0">
              <div
                className="h-full w-full"
                style={{ opacity: 1, height: "auto" }}
              >
                <div className="relative px-4 tablet:px-0">
                  <div
                    className="rounded-4xl border border-global-line-color gradient-twelvelabs w-full max-h-[372px] px-4 py-6 tablet:py-8"
                    style={{
                      background:
                        "linear-gradient(rgb(233, 232, 231) 26.89%, rgba(233, 232, 231, 0) 121.88%), linear-gradient(rgb(233, 232, 231) 22.12%, rgb(132, 219, 26) 73.72%, rgb(250, 185, 32) 88.61%, rgb(255, 181, 146) 98.54%, rgb(246, 175, 255) 108.46%)",
                    }}
                  >
                    <div className="flex flex-col gap-y-6 items-center self-stretch">
                      <div className="aspect-video w-full max-w-[460px] relative">
                        <button
                          className="absolute inset-0 w-full h-full object-contain backdrop-blur-md has-hover:scale-105 transition-transform duration-300 shadow-md rounded-2xl"
                          style={{ zIndex: 1 }}
                        >
                          <img
                            className="w-full h-full rounded-2xl overflow-hidden"
                            height={259}
                            width={460}
                            alt="video walkthrough thumbnail"
                            src="https://playground.twelvelabs.io/_next/image?url=/_next/static/media/video_walkthrough.7b6d6ee2.png&w=1920&q=100"
                            srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvideo_walkthrough.7b6d6ee2.png&w=1080&q=100 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvideo_walkthrough.7b6d6ee2.png&w=1920&q=100 2x"
                            style={{ color: "transparent" }}
                          />
                          <svg
                            className="absolute w-[50px] h-[50px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 filter drop-shadow-[0_32px_24px_rgba(29,28,27,0.20)] has-hover:scale-105 transition-transform duration-300"
                            fill="none"
                            viewBox="0 0 51 51"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <foreignObject
                              height="62.647"
                              width="62.65"
                              x="-6.157"
                              y="-6.156"
                            >
                              <div
                                xmlns="http://www.w3.org/1999/xhtml"
                                style={{
                                  backdropFilter: "blur(3.13px)",
                                  clipPath: 'url("#PlayBtn_svg__a")',
                                  height: "100%",
                                  width: "100%",
                                }}
                              />
                            </foreignObject>
                            <g>
                              <rect
                                height="48.62"
                                width="48.62"
                                fill="#000"
                                fillOpacity="0.6"
                                rx="15.25"
                                x="0.858"
                                y="0.859"
                              />
                              <rect
                                height="48.62"
                                width="48.62"
                                rx="15.25"
                                stroke="#fff"
                                strokeWidth="1.5"
                                x="0.858"
                                y="0.859"
                              />
                              <path
                                d="M13.683 38.442V11.886c0-1.312 1.442-2.112 2.555-1.418l21.278 13.278a1.67 1.67 0 0 1 0 2.834L16.238 39.86c-1.113.694-2.555-.106-2.555-1.418"
                                fill="#fff"
                              />
                            </g>
                            <defs>
                              <clipPath
                                id="PlayBtn_svg__a"
                                transform="translate(6.157 6.156)"
                              >
                                <rect
                                  height="48.62"
                                  width="48.62"
                                  rx="15.25"
                                  x="0.858"
                                  y="0.859"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <button className="absolute top-3.5 right-4 p-3">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 16 16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="m7.31 8.017-2.947 2.946.707.707 2.947-2.946 2.93 2.93.706-.708-2.93-2.93L11.67 5.07l-.707-.707L8.017 7.31 5.054 4.347l-.707.707z"
                        fill="currentColor"
                        fillRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-6 px-4 tablet:px-0">
                <h1 className="text-global-text text-heading6 tablet:text-heading5">
                  Get started
                </h1>
                <div className="flex flex-col tablet:flex-row gap-6">
                  <div className="flex flex-col gap-6 flex-1">
                    <div
                      className="group/next-step-upload-videos p-6 tablet:p-8 border-[0.51px] border-grey-300 rounded-video bg-grey-100 bg-center bg-cover bg-no-repeat"
                      aria-disabled="false"
                      style={{
                        backgroundImage:
                          'url("https://playground.twelvelabs.io/_next/static/media/upload_section_bg.4697fec2.png")',
                      }}
                    >
                      <div className="h-[312px] tablet:h-[232px] max-h-[374px] tablet:max-h-[232px] min-h-[384px] tablet:min-h-[232px]">
                        <div
                          className="relative h-full tablet:px-0 flex items-stretch border border-dashed border-grey-400 rounded-[16px] rounded-video not-aria-disabled:tablet:group-hover/next-step-upload-videos:rounded-(--rounded-video-hover) bg-grey-100/30 backdrop-blur-2xl overflow-hidden not-aria-disabled:tablet:hover:bg-green/10"
                          aria-disabled="false"
                          role="presentation"
                          tabIndex="0"
                        >
                          <div className="absolute inset-0 bg-grey-100/40 cursor-not-allowed invisible" />
                          <input
                            type="file"
                            accept="video/*,.mp4,.webm,.3gp,.mpeg,.avi,.mov,.flv,.wmv,.asf,.mkv,.h265,.h264,.ts,.vob,application/mxf,.mxf,audio/ogg,.ogg,audio/x-m4a,.m4a"
                            multiple
                            tabIndex="-1"
                            style={{ display: "none" }}
                          />
                          <button
                            className="w-full flex flex-col items-center justify-evenly"
                            type="button"
                          >
                            <div className="flex flex-col items-center gap-y-2 text-subtitle1 text-global-text">
                              <svg
                                className="w-11 h-11 text-global-text"
                                fill="none"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  clipRule="evenodd"
                                  d="M8.967 4.52 6.223 7.266l.884.884 2.266-2.266v6.824h1.25V5.882l2.267 2.267.884-.884-2.744-2.744a1.46 1.46 0 0 0-2.063 0m-4.8 11.728h11.667v-1.25H4.167z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                />
                              </svg>
                              Drop videos or browse files
                            </div>
                            <div className="flex flex-wrap tablet:flex-col justify-center items-center gap-x-4 gap-y-3 text-global-text">
                              <div className="text-body3 px-5">
                                To upload videos up to 2hrs, create an index
                                with Marengo only
                              </div>
                              <div className="flex gap-1 flex-wrap justify-center">
                                <div className="text-center tablet:text-left">
                                  <div className="inline-flex items-center text-body3">
                                    <span className="border border-grey-700 rounded-sm px-1 py-0.5">
                                      4sec-1hr
                                    </span>
                                  </div>
                                </div>
                                <div className="text-center tablet:text-left">
                                  <div className="inline-flex items-center text-body3">
                                    <span className="border border-grey-700 rounded-sm px-1 py-0.5">
                                      Resolution 360p-4k
                                    </span>
                                  </div>
                                </div>
                                <div className="text-center tablet:text-left">
                                  <div className="inline-flex items-center text-body3">
                                    <span className="border border-grey-700 rounded-sm px-1 py-0.5">
                                      Ratio 1:1, 4:3, 5:4, 16:9, 17:9
                                    </span>
                                  </div>
                                </div>
                                <div className="text-center tablet:text-left">
                                  <div className="inline-flex items-center text-body3">
                                    <span className="border border-grey-700 rounded-sm px-1 py-0.5">
                                      File size Ã¢â€°Â¤2GB per video
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 tablet:gap-6 flex-1">
                      <div className="flex-1">
                        <a
                          className="group/next-step-button inline-block relative w-full h-full"
                          aria-disabled="false"
                          href="https://docs.twelvelabs.io/v1.3/docs/resources/partner-integrations"
                          target="_blank"
                        >
                          <div className="flex flex-col justify-center gap-10 p-6 tablet:px-8 tablet:py-6 h-full">
                            <div className="flex justify-between gap-4 tablet:gap-12 flex-1">
                              <span className="flex items-center text-body3 tablet:text-subtitle1 text-global-text">
                                Partner integrations
                              </span>
                              <div className="flex items-center justify-center">
                                <span className="size-9 tablet:size-10 text-global-text">
                                  <svg
                                    fill="none"
                                    viewBox="0 0 16 16"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="m3.293 5.682 1.975 1.975-.707.707-2.122-2.121a1.5 1.5 0 0 1 0-2.122l2.122-2.12.707.706-1.975 1.975H14v1zM12.707 11.318l-1.975 1.975.707.707 2.122-2.121a1.5 1.5 0 0 0 0-2.122l-2.122-2.12-.707.706 1.975 1.975H2v1z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute inset-0 z-1 bg-tl25-master2 rounded-video tablet:group-hover/next-step-button:rounded-(--rounded-video-hover)" />
                          <div className="absolute left-6 top-4 bottom-4 right-6 z-2 tablet:group-hover/next-step-button:bg-light-orange tablet:group-hover/next-step-button:rounded-[90px]" />
                          <div className="absolute inset-0 z-3 tablet:group-hover/next-step-button:rounded-[90px] tablet:group-hover/next-step-button:backdrop-blur-xl" />
                          <div className="absolute inset-0 z-3 border-[0.51px] border-grey-300 rounded-video tablet:group-hover/next-step-button:rounded-(--rounded-video-hover)" />
                          <div className="absolute inset-0 z-4 flex flex-col justify-center gap-10 p-6 tablet:py-8 h-full">
                            <div className="flex justify-between gap-4 tablet:gap-12 flex-1">
                              <span className="flex items-center text-body3 tablet:text-subtitle1 text-global-text">
                                Partner integrations
                              </span>
                              <div className="flex items-center justify-center">
                                <span className="size-9 tablet:size-10 text-global-text">
                                  <svg
                                    fill="none"
                                    viewBox="0 0 16 16"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="m3.293 5.682 1.975 1.975-.707.707-2.122-2.121a1.5 1.5 0 0 1 0-2.122l2.122-2.12.707.706-1.975 1.975H14v1zM12.707 11.318l-1.975 1.975.707.707 2.122-2.121a1.5 1.5 0 0 0 0-2.122l-2.122-2.12-.707.706 1.975 1.975H2v1z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </span>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                      <div className="flex-1">
                        <a
                          className="group/next-step-button inline-block relative w-full h-full"
                          aria-disabled="false"
                          href="https://playground.twelvelabs.io/dashboard/organization"
                          target="_self"
                        >
                          <div className="flex flex-col justify-center gap-10 p-6 tablet:px-8 tablet:py-6 h-full">
                            <div className="flex justify-between gap-4 tablet:gap-12 flex-1">
                              <span className="flex items-center text-body3 tablet:text-subtitle1 text-global-text">
                                Invite your team members
                              </span>
                              <div className="flex items-center justify-center">
                                <span className="size-9 tablet:size-10 text-global-text">
                                  <svg
                                    fill="none"
                                    viewBox="0 0 16 16"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M10 9.833H4.667C3.47 9.833 2.5 10.803 2.5 12v2h-1v-2a3.167 3.167 0 0 1 3.167-3.166H10zm3.5.667h2v1h-2v2h-1v-2h-2v-1h2v-2h1zM8.001 2.666A2.667 2.667 0 1 1 7.999 8a2.667 2.667 0 0 1 .002-5.334m0 1.001a1.667 1.667 0 1 0 0 3.333 1.667 1.667 0 0 0 0-3.333"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute inset-0 z-1 bg-tl25-master2 rounded-video tablet:group-hover/next-step-button:rounded-(--rounded-video-hover)" />
                          <div className="absolute left-6 top-4 bottom-4 right-6 z-2 tablet:group-hover/next-step-button:bg-light-green tablet:group-hover/next-step-button:rounded-[62px]" />
                          <div className="absolute inset-0 z-3 tablet:group-hover/next-step-button:rounded-[62px] tablet:group-hover/next-step-button:backdrop-blur-xl" />
                          <div className="absolute inset-0 z-3 border-[0.51px] border-grey-300 rounded-video tablet:group-hover/next-step-button:rounded-(--rounded-video-hover)" />
                          <div className="absolute inset-0 z-4 flex flex-col justify-center gap-10 p-6 tablet:py-8 h-full">
                            <div className="flex justify-between gap-4 tablet:gap-12 flex-1">
                              <span className="flex items-center text-body3 tablet:text-subtitle1 text-global-text">
                                Invite your team members
                              </span>
                              <div className="flex items-center justify-center">
                                <span className="size-9 tablet:size-10 text-global-text">
                                  <svg
                                    fill="none"
                                    viewBox="0 0 16 16"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M10 9.833H4.667C3.47 9.833 2.5 10.803 2.5 12v2h-1v-2a3.167 3.167 0 0 1 3.167-3.166H10zm3.5.667h2v1h-2v2h-1v-2h-2v-1h2v-2h1zM8.001 2.666A2.667 2.667 0 1 1 7.999 8a2.667 2.667 0 0 1 .002-5.334m0 1.001a1.667 1.667 0 1 0 0 3.333 1.667 1.667 0 0 0 0-3.333"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </span>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                  <a
                    className="group/next-step-button inline-block relative"
                    href="https://playground.twelvelabs.io/examples"
                    target="_self"
                  >
                    <div className="flex flex-col justify-center gap-10 p-6 tablet:p-8">
                      <img
                        className="basis-full w-full h-auto object-contain"
                        height={450}
                        width={532}
                        alt="Explore our examples!"
                        src="https://playground.twelvelabs.io/_next/image?url=/_next/static/media/next-step-examples.78cfa337.png&w=1920&q=75"
                        srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fnext-step-examples.78cfa337.png&w=640&q=75 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fnext-step-examples.78cfa337.png&w=1920&q=75 2x"
                        style={{ color: "transparent" }}
                      />
                      <div className="flex justify-between gap-4 tablet:gap-12 flex-1">
                        <span className="flex items-center text-global-text text-body1 tablet:text-subtitle1">
                          Explore our examples!
                        </span>
                        <div className="flex items-center justify-center">
                          <span className="size-9 tablet:size-10 text-global-text">
                            <svg
                              fill="none"
                              viewBox="0 0 16 16"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                clipRule="evenodd"
                                d="M6.116 6h3.768L8 2.918zm4.133 6.751c.393.394.846.582 1.418.582.57 0 1.024-.188 1.418-.582s.582-.846.582-1.418c0-.57-.189-1.024-.582-1.418a1.9 1.9 0 0 0-1.418-.582c-.572 0-1.025.189-1.418.582a1.9 1.9 0 0 0-.582 1.418c0 .572.188 1.025.582 1.418M3 10.267V12.4a.6.6 0 0 0 .6.6h2.133a.6.6 0 0 0 .6-.6v-2.133a.6.6 0 0 0-.6-.6H3.6a.6.6 0 0 0-.6.6m1.83-4.078A.533.533 0 0 0 5.283 7h5.432a.533.533 0 0 0 .455-.811L8.455 1.745a.533.533 0 0 0-.91 0zm4.712 7.27a2.9 2.9 0 0 0 2.125.874q1.25 0 2.125-.875a2.9 2.9 0 0 0 .875-2.125q0-1.25-.875-2.125a2.9 2.9 0 0 0-2.125-.875q-1.25 0-2.125.875a2.9 2.9 0 0 0-.875 2.125q0 1.25.875 2.125M2 12.4A1.6 1.6 0 0 0 3.6 14h2.133a1.6 1.6 0 0 0 1.6-1.6v-2.133a1.6 1.6 0 0 0-1.6-1.6H3.6a1.6 1.6 0 0 0-1.6 1.6z"
                                fill="currentColor"
                                fillRule="evenodd"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 z-1 bg-tl25-master2 rounded-video tablet:group-hover/next-step-button:rounded-(--rounded-video-hover)" />
                    <div className="absolute left-6 top-4 bottom-4 right-6 z-2 tablet:group-hover/next-step-button:bg-light-peach tablet:group-hover/next-step-button:rounded-[62px]" />
                    <div className="absolute inset-0 z-3 tablet:group-hover/next-step-button:rounded-[62px] tablet:group-hover/next-step-button:backdrop-blur-xl" />
                    <div className="absolute inset-0 z-3 border-[0.51px] border-grey-300 rounded-video tablet:group-hover/next-step-button:rounded-(--rounded-video-hover)" />
                    <div className="absolute inset-0 z-4 flex flex-col justify-center gap-10 p-6 tablet:p-8">
                      <img
                        className="basis-full w-full h-auto object-contain"
                        height={450}
                        width={532}
                        alt="Explore our examples!"
                        src="https://playground.twelvelabs.io/_next/image?url=/_next/static/media/next-step-examples.78cfa337.png&w=1920&q=75"
                        srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fnext-step-examples.78cfa337.png&w=640&q=75 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fnext-step-examples.78cfa337.png&w=1920&q=75 2x"
                        style={{ color: "transparent" }}
                      />
                      <div className="flex justify-between gap-4 tablet:gap-12 flex-1">
                        <span className="flex items-center text-global-text text-body1 tablet:text-subtitle1">
                          Explore our examples!
                        </span>
                        <div className="flex items-center justify-center">
                          <span className="size-9 tablet:size-10 text-global-text">
                            <svg
                              fill="none"
                              viewBox="0 0 16 16"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                clipRule="evenodd"
                                d="M6.116 6h3.768L8 2.918zm4.133 6.751c.393.394.846.582 1.418.582.57 0 1.024-.188 1.418-.582s.582-.846.582-1.418c0-.57-.189-1.024-.582-1.418a1.9 1.9 0 0 0-1.418-.582c-.572 0-1.025.189-1.418.582a1.9 1.9 0 0 0-.582 1.418c0 .572.188 1.025.582 1.418M3 10.267V12.4a.6.6 0 0 0 .6.6h2.133a.6.6 0 0 0 .6-.6v-2.133a.6.6 0 0 0-.6-.6H3.6a.6.6 0 0 0-.6.6m1.83-4.078A.533.533 0 0 0 5.283 7h5.432a.533.533 0 0 0 .455-.811L8.455 1.745a.533.533 0 0 0-.91 0zm4.712 7.27a2.9 2.9 0 0 0 2.125.874q1.25 0 2.125-.875a2.9 2.9 0 0 0 .875-2.125q0-1.25-.875-2.125a2.9 2.9 0 0 0-2.125-.875q-1.25 0-2.125.875a2.9 2.9 0 0 0-.875 2.125q0 1.25.875 2.125M2 12.4A1.6 1.6 0 0 0 3.6 14h2.133a1.6 1.6 0 0 0 1.6-1.6v-2.133a1.6 1.6 0 0 0-1.6-1.6H3.6a1.6 1.6 0 0 0-1.6 1.6z"
                                fill="currentColor"
                                fillRule="evenodd"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div
                id="My indexes"
                className="px-5 tablet:px-0 flex flex-col gap-y-4 tablet:gap-y-6"
              >
                <div className="flex justify-between items-start self-stretch gap-x-6">
                  <div className="flex flex-col flex-[1_0_0] justify-center items-start gap-y-2">
                    <div className="w-full flex flex-col gap-y-2">
                      <div className="flex items-center gap-x-1">
                        <p className="whitespace-nowrap text-global-text text-subtitle1 tablet:text-heading6">
                          My indexes
                        </p>
                        <span>
                          <span>
                            <svg
                              className="h-4.5 w-4.5 text-grey-500 cursor-pointer"
                              fill="none"
                              viewBox="0 0 16 16"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                clipRule="evenodd"
                                d="M5.6 3h4.8A2.6 2.6 0 0 1 13 5.6v4.8a2.6 2.6 0 0 1-2.6 2.6H5.6A2.6 2.6 0 0 1 3 10.4V5.6A2.6 2.6 0 0 1 5.6 3M2 5.6A3.6 3.6 0 0 1 5.6 2h4.8A3.6 3.6 0 0 1 14 5.6v4.8a3.6 3.6 0 0 1-3.6 3.6H5.6A3.6 3.6 0 0 1 2 10.4zm6.667-.933H7.333V6h1.334zm0 2.666H7.333v4h1.334z"
                                fill="currentColor"
                                fillRule="evenodd"
                              />
                            </svg>
                          </span>
                        </span>
                      </div>
                    </div>
                    <a
                      className="flex items-center gap-x-1 tablet:hover:underline text-body2 text-grey-600"
                      href="https://playground.twelvelabs.io/indexes"
                    >
                      See full list
                      <svg
                        className="text-inherit h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          clipRule="evenodd"
                          d="M10.268 5.86 8.732 7.14l4.466 5.36-4.466 5.36 1.536 1.28 5.534-6.64z"
                          fill="currentColor"
                          fillRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                  <button
                    className="relative justify-center items-center transition-all capitalize disabled:bg-grey-100 disabled:text-grey-500 disabled:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.10)_inset] bg-transparent tablet:not-disabled:hover:bg-black/10 text-global-text shadow-[0px_0px_0px_1px_var(--color-grey-700)_inset] px-[18px] min-h-12 rounded-[14.4px] tablet:not-disabled:hover:rounded-[19.4px] text-body1 gap-x-2 whitespace-nowrap hidden tablet:flex"
                    type="button"
                  >
                    Create Index
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M27.335 11.999v10.666a2 2 0 0 1-2 2H6.668a2 2 0 0 1-2-2V9.332a2 2 0 0 1 2-2h4.122a2 2 0 0 1 1.11.336l1.984 1.323a6 6 0 0 0 3.328 1.008h8.123a2 2 0 0 1 2 2m2 0v10.666a4 4 0 0 1-4 4H6.668a4 4 0 0 1-4-4V9.332a4 4 0 0 1 4-4h4.122a4 4 0 0 1 2.219.672l1.985 1.323a4 4 0 0 0 2.218.672h8.123a4 4 0 0 1 4 4m-14.335 9v-3h-3v-2h3v-3h2v3h3v2h-3v3z"
                        fill="currentColor"
                        fillRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    className="relative flex justify-center items-center transition-all capitalize disabled:bg-grey-100 disabled:text-grey-500 disabled:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.10)_inset] bg-transparent tablet:not-disabled:hover:bg-black/10 text-global-text shadow-[0px_0px_0px_1px_var(--color-grey-700)_inset] px-3 min-h-8 rounded-[9.6px] tablet:not-disabled:hover:rounded-[12px] text-body2 gap-x-1 whitespace-nowrap tablet:hidden"
                    type="button"
                  >
                    Create Index
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M27.335 11.999v10.666a2 2 0 0 1-2 2H6.668a2 2 0 0 1-2-2V9.332a2 2 0 0 1 2-2h4.122a2 2 0 0 1 1.11.336l1.984 1.323a6 6 0 0 0 3.328 1.008h8.123a2 2 0 0 1 2 2m2 0v10.666a4 4 0 0 1-4 4H6.668a4 4 0 0 1-4-4V9.332a4 4 0 0 1 4-4h4.122a4 4 0 0 1 2.219.672l1.985 1.323a4 4 0 0 0 2.218.672h8.123a4 4 0 0 1 4 4m-14.335 9v-3h-3v-2h3v-3h2v3h3v2h-3v3z"
                        fill="currentColor"
                        fillRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div>
                  <div
                    className="h-full w-full"
                    style={{ opacity: 1, height: "auto" }}
                  >
                    <div className="flex items-center justify-between gap-x-2 px-3 py-2 bg-light-green border-black/10 tablet:rounded-lg rounded-2xl">
                      <div className="flex flex-1 gap-x-2 items-center">
                        <svg
                          className="h-5 min-w-5 text-global-text"
                          fill="none"
                          viewBox="0 0 16 16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            clipRule="evenodd"
                            d="M5.6 3h4.8A2.6 2.6 0 0 1 13 5.6v4.8a2.6 2.6 0 0 1-2.6 2.6H5.6A2.6 2.6 0 0 1 3 10.4V5.6A2.6 2.6 0 0 1 5.6 3M2 5.6A3.6 3.6 0 0 1 5.6 2h4.8A3.6 3.6 0 0 1 14 5.6v4.8a3.6 3.6 0 0 1-3.6 3.6H5.6A3.6 3.6 0 0 1 2 10.4zm6.667-.933H7.333V6h1.334zm0 2.666H7.333v4h1.334z"
                            fill="currentColor"
                            fillRule="evenodd"
                          />
                        </svg>
                        <div className="text-body2 text-grey-700 mr-auto">
                          You are currently on the Free Plan, which means that
                          your index will expire 90 days after it was created.
                        </div>
                      </div>
                      <svg
                        className="h-4 w-4 cursor-pointer"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-y-10">
                  <div className="w-full grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-10">
                    <a href="https://playground.twelvelabs.io/indexes/68e40c18f2e53b115e1b5c1f/videos">
                      <div className="cursor-pointer">
                        <div className="relative rounded-video overflow-hidden">
                          <div className="aspect-video w-full bg-grey-700 !bg-light-pink" />
                          <div
                            className="absolute inset-0 top-[60%] z-0"
                            style={{
                              background:
                                "linear-gradient(rgba(29, 28, 27, 0) 0%, rgba(29, 28, 27, 0.44) 50%, rgba(29, 28, 27, 0.65) 100%)",
                            }}
                          />
                          <div className="absolute left-8 bottom-5">
                            <div className="flex flex-wrap items-center justify-end gap-3">
                              <div className="flex items-center gap-x-1">
                                <svg
                                  className="h-5 w-5 text-white"
                                  fill="none"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    clipRule="evenodd"
                                    d="M9.44 8.488v3.024L11.582 10zm-1.315-.594c0-.823.918-1.305 1.587-.833l2.983 2.106a1.022 1.022 0 0 1 0 1.666L9.712 12.94c-.669.472-1.587-.01-1.587-.833z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                  />
                                  <path
                                    clipRule="evenodd"
                                    d="M13 3.75H7A3.25 3.25 0 0 0 3.75 7v6A3.25 3.25 0 0 0 7 16.25h6A3.25 3.25 0 0 0 16.25 13V7A3.25 3.25 0 0 0 13 3.75M7 2.5A4.5 4.5 0 0 0 2.5 7v6A4.5 4.5 0 0 0 7 17.5h6a4.5 4.5 0 0 0 4.5-4.5V7A4.5 4.5 0 0 0 13 2.5z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                  />
                                </svg>
                                <p className="text-body2 whitespace-nowrap text-white">
                                  0 Videos (0s)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="py-4 flex flex-col gap-y-2">
                          <div className="flex items-center justify-between">
                            <span className="w-full">
                              <p className="truncate text-subtitle1 text-global-text w-[90%]">
                                My Index (Default)
                              </p>
                            </span>
                            <div>
                              <button
                                id=":rel:"
                                className="MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit MuiIconButton-sizeSmall css-1bsg61r"
                                type="button"
                                aria-label="more"
                                tabIndex="0"
                                style={{
                                  outline: "0px",
                                  border: "0px",
                                  margin: "0px",
                                  textDecoration: "none",
                                  flex: "0 0 auto",
                                  borderRadius: "50%",
                                  transition:
                                    "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)",
                                  padding: "5px",
                                  display: "inline-flex",
                                  WebkitBoxAlign: "center",
                                  alignItems: "center",
                                  WebkitBoxPack: "center",
                                  justifyContent: "center",
                                  position: "relative",
                                  boxSizing: "border-box",
                                  WebkitTapHighlightColor: "transparent",
                                  backgroundColor: "transparent",
                                  cursor: "pointer",
                                  userSelect: "none",
                                  verticalAlign: "middle",
                                  appearance: "none",
                                  textAlign: "center",
                                  color: "inherit",
                                  fontSize: "1.125rem",
                                }}
                              >
                                <svg
                                  className="h-5 w-5 text-global-text"
                                  fill="none"
                                  viewBox="0 0 16 17"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    clipRule="evenodd"
                                    d="M8 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m0 1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m0 3a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m0 1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m.5 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m1 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-body3 text-grey-600">
                            Created on Oct 06, 2025
                          </p>
                        </div>
                      </div>
                    </a>
                    <a href="https://playground.twelvelabs.io/indexes/6785dfaa49d9c923603e5268/search">
                      <div className="cursor-pointer">
                        <div className="relative rounded-video overflow-hidden">
                          <div className="relative aspect-[9/5] w-full overflow-hidden grid gap-0.5 grid-cols-2 grid-rows-2">
                            <div className="aspect-video w-full bg-grey-700 overflow-hidden !aspect-auto">
                              <img
                                className="bg-grey-900 w-full h-full object-cover"
                                height={99}
                                width={179}
                                alt="https://deuqpmn4rs7j5.cloudfront.net/642682228e079b9c96f4a63b/6791d98e246c42594d690366/thumbnails/26a08b96-3dcc-414d-8716-a73d6fb08ace.0000001.jpg"
                                src="https://deuqpmn4rs7j5.cloudfront.net/642682228e079b9c96f4a63b/6791d98e246c42594d690366/thumbnails/26a08b96-3dcc-414d-8716-a73d6fb08ace.0000001.jpg"
                                style={{ color: "transparent" }}
                              />
                            </div>
                            <div className="aspect-video w-full bg-grey-700 overflow-hidden !aspect-auto">
                              <img
                                className="bg-grey-900 w-full h-full object-cover"
                                height={99}
                                width={179}
                                alt="https://deuqpmn4rs7j5.cloudfront.net/642682228e079b9c96f4a63b/6785ef094cdd7e895ce16b80/thumbnails/31fecc7a-9943-461f-be3c-b14c038dee78.0000001.jpg"
                                src="https://deuqpmn4rs7j5.cloudfront.net/642682228e079b9c96f4a63b/6785ef094cdd7e895ce16b80/thumbnails/31fecc7a-9943-461f-be3c-b14c038dee78.0000001.jpg"
                                style={{ color: "transparent" }}
                              />
                            </div>
                            <div className="aspect-video w-full bg-grey-700 overflow-hidden !aspect-auto">
                              <img
                                className="bg-grey-900 w-full h-full object-cover"
                                height={99}
                                width={179}
                                alt="https://deuqpmn4rs7j5.cloudfront.net/642682228e079b9c96f4a63b/6785ef0849d9c923603e53c7/thumbnails/bf0c474b-85ea-46b6-84e4-d11dcb68e176.0000001.jpg"
                                src="https://deuqpmn4rs7j5.cloudfront.net/642682228e079b9c96f4a63b/6785ef0849d9c923603e53c7/thumbnails/bf0c474b-85ea-46b6-84e4-d11dcb68e176.0000001.jpg"
                                style={{ color: "transparent" }}
                              />
                            </div>
                            <div className="aspect-video w-full bg-grey-700 overflow-hidden !aspect-auto">
                              <img
                                className="bg-grey-900 w-full h-full object-cover"
                                height={99}
                                width={179}
                                alt="https://deuqpmn4rs7j5.cloudfront.net/642682228e079b9c96f4a63b/6785ef0749d9c923603e53c4/thumbnails/a72541d1-6f30-4f55-8bf9-bafb88a828ac.0000001.jpg"
                                src="https://deuqpmn4rs7j5.cloudfront.net/642682228e079b9c96f4a63b/6785ef0749d9c923603e53c4/thumbnails/a72541d1-6f30-4f55-8bf9-bafb88a828ac.0000001.jpg"
                                style={{ color: "transparent" }}
                              />
                            </div>
                          </div>
                          <div
                            className="absolute inset-0 top-[60%] z-0"
                            style={{
                              background:
                                "linear-gradient(rgba(29, 28, 27, 0) 0%, rgba(29, 28, 27, 0.44) 50%, rgba(29, 28, 27, 0.65) 100%)",
                            }}
                          />
                          <span className="inline-flex items-center border border-global-text text-global-text px-1 py-1 max-h-[20px] bg-white rounded-[6px] absolute top-5 left-8">
                            <span className="text-all-caps leading-none text-inherit uppercase">
                              SAMPLE
                            </span>
                          </span>
                          <div className="absolute left-8 bottom-5">
                            <div className="flex flex-wrap items-center justify-end gap-3">
                              <div className="flex items-center gap-x-1">
                                <svg
                                  className="h-5 w-5 text-white"
                                  fill="none"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    clipRule="evenodd"
                                    d="M9.44 8.488v3.024L11.582 10zm-1.315-.594c0-.823.918-1.305 1.587-.833l2.983 2.106a1.022 1.022 0 0 1 0 1.666L9.712 12.94c-.669.472-1.587-.01-1.587-.833z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                  />
                                  <path
                                    clipRule="evenodd"
                                    d="M13 3.75H7A3.25 3.25 0 0 0 3.75 7v6A3.25 3.25 0 0 0 7 16.25h6A3.25 3.25 0 0 0 16.25 13V7A3.25 3.25 0 0 0 13 3.75M7 2.5A4.5 4.5 0 0 0 2.5 7v6A4.5 4.5 0 0 0 7 17.5h6a4.5 4.5 0 0 0 4.5-4.5V7A4.5 4.5 0 0 0 13 2.5z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                  />
                                </svg>
                                <p className="text-body2 whitespace-nowrap text-white">
                                  163 Videos (8h 46m)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="py-4 flex flex-col gap-y-2">
                          <div className="flex items-center justify-between">
                            <span className="w-full">
                              <p className="truncate text-subtitle1 text-global-text w-[90%]">
                                Sample Index: Mix
                              </p>
                            </span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <style
        dangerouslySetInnerHTML={{
          __html: `
body {
  touch-action: pan-x pan-y;
}
`,
        }}
      />
    </>
  );
}

