import React from "react";

// Common styles as CSS-in-JS objects
const styles = {
  base: {
    boxSizing: "border-box" as const,
    WebkitFontSmoothing: "antialiased" as const,
    userSelect: "none" as const,
    outline: "none",
  },
  panelStack: {
    display: "flex",
    height: "100%",
    flexDirection: "column" as const,
  },
  panelWrapper: {
    flex: "1 0 0px",
    position: "relative" as const,
    minHeight: "0px",
  },
  scroll: {
    position: "relative" as const,
    overflow: "hidden overlay" as const,
    scrollbarWidth: "none" as const,
    padding: "0px 15px 15px",
    height: "100%",
  },
  wrapper: {
    position: "relative" as const,
    width: "100%",
  },
  alignmentToolbar: {
    display: "flex",
    width: "100%",
    height: "60px",
    alignItems: "center",
    justifyContent: "space-between",
    color: "var(--framer-fresco-inputIconDisabled-color, #bbbbbb)",
  },
  alignmentButton: {
    color: "var(--framer-fresco-tint-color, #0099ff)",
    cursor: "pointer",
    display: "flex",
    width: "22px",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    position: "relative" as const,
    width: "100%",
    paddingBottom: "10px",
    paddingTop: "0px",
  },
  emptyPanel: {
    paddingTop: "0px",
    paddingBottom: "0px",
  },
  panelHeader: {
    overflow: "hidden",
    position: "relative" as const,
    display: "flex",
    width: "100%",
    height: "48px",
    flexDirection: "row" as const,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    color: "var(--framer-fresco-panelTitle-color, #333333)",
    cursor: "default",
    borderTop: "1px solid var(--framer-fresco-panelDivider-color, #eeeeee)",
  },
  clickableHeader: {
    cursor: "pointer",
  },
  panelTitle: {
    overflow: "hidden",
    whiteSpace: "nowrap" as const,
    textOverflow: "ellipsis",
    minWidth: "0px",
    fontSize: "var(--framer-fresco-base-font-size, 12px)",
    fontWeight: "var(--framer-fresco-heading-font-weight, 600)",
  },
  flex: {
    flex: "1 1 0%",
    minWidth: "8px",
    minHeight: "8px",
  },
  headerActions: {
    display: "inline-flex",
    flexDirection: "row" as const,
    alignItems: "center",
    marginRight: "-4px",
  },
  headerButton: {
    display: "flex",
    width: "20px",
    height: "30px",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--framer-fresco-panelSectionHeaderIcon-color, #222222)",
    cursor: "pointer",
  },
  panelRow: {
    position: "relative" as const,
    display: "grid",
    width: "100%",
    paddingTop: "5px",
    paddingBottom: "5px",
    columnGap: "10px",
    gridTemplateColumns: "minmax(0px, 1.5fr) repeat(2, minmax(62px, 1fr))",
    gridTemplateRows: "auto",
  },
  titleWrapper: {
    position: "relative" as const,
    display: "flex",
    height: "30px",
    alignItems: "center",
    paddingLeft: "15px",
  },
  rowTitle: {
    overflow: "hidden",
    whiteSpace: "nowrap" as const,
    textOverflow: "ellipsis",
    transition: "color 0.2s",
    color: "var(--framer-fresco-panelRowTitle-color, #666666)",
    fontSize: "var(--framer-fresco-base-font-size, 12px)",
    fontWeight: "var(--framer-fresco-base-font-weight, 500)",
    lineHeight: "16px",
    pointerEvents: "none" as const,
  },
  input: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--framer-fresco-inputBorder-color, transparent)",
    borderRadius: "8px",
    background: "var(--framer-fresco-inputBackground-color, #f3f3f3)",
    display: "flex",
    width: "auto",
    height: "30px",
    minHeight: "30px",
    flexDirection: "row" as const,
    alignItems: "center",
    color: "var(--framer-fresco-inputIcon-color, #999999)",
    overflow: "hidden",
    position: "relative" as const,
  },
  textInput: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    fontFeatureSettings: '"cv01", "cv09"',
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--framer-fresco-inputBorder-color, transparent)",
    borderRadius: "8px",
    color: "var(--framer-fresco-inputText-color, #333333)",
    fontSize: "var(--framer-fresco-base-font-size, 12px)",
    fontWeight: "var(--framer-fresco-base-font-weight, 500)",
    padding: "0px 7px 1px",
    height: "30px",
    fontVariantNumeric: "tabular-nums" as const,
    border: "none",
    background: "none",
    width: "1px",
    flexGrow: 1,
    userSelect: "text" as const,
  },
  segmentedControl: {
    overflow: "visible",
    border: "1px solid var(--framer-fresco-segmentedControlBorder-color, transparent)",
    borderRadius: "8px",
    display: "flex",
    height: "30px",
    flexDirection: "row" as const,
    backgroundColor: "var(--framer-fresco-segmentedControlBackground-color, #f3f3f3)",
    cursor: "default",
    textAlign: "center" as const,
    userSelect: "none" as const,
  },
};

// Reusable components
const AlignmentButton = ({ title, children, isActive = false }: { title: string; children: React.ReactNode; isActive?: boolean }) => (
  <div
    className={`alignment-button ${isActive ? 'buttonStyleActive_b9f5udu' : ''}`}
    title={title}
    style={{
      ...styles.base,
      ...styles.alignmentButton,
    }}
  >
    {children}
  </div>
);

const PanelHeader = ({ title, subtitle, isClickable = false, hasActions = true, children }: { 
  title: string; 
  subtitle?: string; 
  isClickable?: boolean; 
  hasActions?: boolean; 
  children?: React.ReactNode;
}) => (
  <div
    className={`header_h10l6u5c panelDivider_psmj6sh ${isClickable ? 'clickable_c1ao5210' : ''}`}
    style={{
      ...styles.base,
      ...styles.panelHeader,
      ...(isClickable ? styles.clickableHeader : {}),
    }}
  >
    <div className="truncateWithEllipsis_t1295uka title_t1k6az3b" style={{...styles.base, ...styles.panelTitle}}>
      <span className="translate" style={styles.base}>{title}</span>
    </div>
    {children}
    <div className="flex_fpc582v" style={{...styles.base, ...styles.flex}} />
    {subtitle && (
      <div className="subtitle_sxfteui" style={{
        ...styles.base,
        margin: "2px 4px 0px",
        color: "var(--framer-fresco-dropdownText-color, #999999)",
        fontSize: "10px",
      }}>
        {subtitle}
      </div>
    )}
    {hasActions && (
      <div className="headerActions_h161tq0v" style={{...styles.base, ...styles.headerActions}}>
        <div className="headerButton_hsz4dac" style={{...styles.base, ...styles.headerButton}}>
          <PlusIcon />
        </div>
      </div>
    )}
  </div>
);

const PanelRow = ({ title, children, hasButton = false }: { 
  title: string; 
  children: React.ReactNode; 
  hasButton?: boolean;
}) => (
  <div
    className={`panelRowView_p1oxlfbn ${hasButton ? 'withButtonCursor_w1chribc' : ''}`}
    role="button"
    tabIndex={-1}
    style={{
      ...styles.base,
      ...styles.panelRow,
      ...(hasButton ? { cursor: "pointer" } : {}),
    }}
  >
    <div className="titleWrapper_t3p7r61" style={{...styles.base, ...styles.titleWrapper}}>
      <div className="truncateWithEllipsis_t1295uka title_t1ih3ztb" style={{...styles.base, ...styles.rowTitle}}>
        <span className="translate" style={styles.base}>{title}</span>
      </div>
    </div>
    {children}
  </div>
);

const TextInput = ({ defaultValue, placeholder = "0", label }: { 
  defaultValue?: string; 
  placeholder?: string; 
  label?: string;
}) => (
  <div className="inputWrapper_i1ubxgci wrapper_w10jibcp" style={{...styles.base, ...styles.input}}>
    <input
      className="textInputSharedStyles_tarvkue input_i1v4gay9 numberInput_n1obifo6"
      type="text"
      autoComplete="nope"
      defaultValue={defaultValue}
      placeholder={placeholder}
      autoCorrect="off"
      style={{...styles.base, ...styles.textInput}}
    />
    {label && (
      <div className="inputLabel_i6l13uv" style={{
        ...styles.base,
        padding: "0px 6px",
        background: "linear-gradient(to right,transparent 0%,var(--framer-fresco-inputBackground-color, #f3f3f3) 33%,var(--framer-fresco-inputBackground-color, #f3f3f3) 100%)",
        position: "absolute" as const,
        zIndex: 1,
        top: "0px",
        right: "0px",
        bottom: "0px",
        display: "flex",
        width: "auto",
        alignItems: "center",
        color: "var(--framer-fresco-inputLabel-color, #999999)",
        fontSize: "var(--framer-fresco-labelSmall-font-size, 9px)",
        lineHeight: "var(--framer-fresco-label-font-size, 10px)",
        pointerEvents: "none" as const,
      }}>
        {label}
      </div>
    )}
  </div>
);

const SegmentedControl = ({ options, selectedIndex = 0, gridColumn, onChange }: { 
  options: string[]; 
  selectedIndex?: number; 
  gridColumn?: string;
  onChange?: (index: number, value: string) => void;
}) => (
  <div 
    className="segmentedControl_s56pukx" 
    style={{
      ...styles.base, 
      ...styles.segmentedControl,
      ...(gridColumn ? { gridColumn } : {})
    }}
  >
    <div className="segmentsWrapper_shkk1lc" style={{
      ...styles.base,
      flex: "1 1 0%",
      position: "relative" as const,
      display: "flex",
      alignContent: "stretch",
      alignItems: "center",
      flexDirection: "row" as const,
    }}>
      <div className="segmentedControlSegmentBackground_s1ezhwod" style={{
        ...styles.base,
        position: "absolute" as const,
        height: "100%",
        width: `${100 / options.length}%`,
        left: `${(selectedIndex * 100) / options.length}%`,
      }} />
      {options.map((option, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <div className={`divider_d61xro3 ${selectedIndex === index - 1 || selectedIndex === index ? 'hiddenDivider_hyiclh3' : ''}`} style={{
              ...styles.base,
              borderRadius: "2px",
              transition: "opacity 0.2s",
              width: "1px",
              height: "14px",
              backgroundColor: "var(--framer-fresco-segmentedControlDivider-color, #e6e6e6)",
              opacity: (selectedIndex === index - 1 || selectedIndex === index) ? 0 : 1,
            }} />
          )}
          <a 
            className={`segment_s1tes2cq truncateWithEllipsis_t1295uka ${selectedIndex === index ? 'segmentSelected_s8ln65c' : ''}`} 
            onClick={() => onChange?.(index, option)}
            style={{
              ...styles.base,
              overflow: "hidden",
              whiteSpace: "nowrap" as const,
              textOverflow: "ellipsis",
              padding: "0px 4px",
              transition: "color 0.2s",
              position: "relative" as const,
              display: "flex",
              flexDirection: "row" as const,
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--framer-fresco-base-font-size, 12px)",
              lineHeight: "22px",
              userSelect: "none" as const,
              color: selectedIndex === index 
                ? "var(--framer-fresco-segmentedControlItemTextSelected-color, #0099ff)"
                : "var(--framer-fresco-segmentedControlItemText-color, #999999)",
              fontWeight: selectedIndex === index
                ? "var(--framer-fresco-heading-font-weight, 600)"
                : "var(--framer-fresco-base-font-weight, 500)",
              cursor: "pointer",
              width: "1px",
              height: "100%",
            }}>
            <div className="titleWrapper_t1dxn7q" style={{...styles.base, minWidth: "0px"}}>
              {option}
            </div>
          </a>
        </React.Fragment>
      ))}
    </div>
  </div>
);

// Icon components
const PlusIcon = () => (
  <svg height="10" width="10" xmlns="http://www.w3.org/2000/svg" style={styles.base}>
    <path d="M4 .75a.75.75 0 0 1 1.5 0v8a.75.75 0 0 1-1.5 0Z" fill="currentColor" style={styles.base} />
    <path d="M0 4.75A.75.75 0 0 1 .75 4h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 0 4.75Z" fill="currentColor" style={styles.base} />
  </svg>
);

const AlignLeftIcon = () => (
  <svg height="16" width="14" xmlns="http://www.w3.org/2000/svg" style={styles.base}>
    <path d="M 0 0.5 C 0 0.224 0.224 0 0.5 0 L 0.5 0 C 0.776 0 1 0.224 1 0.5 L 1 15.5 C 1 15.776 0.776 16 0.5 16 L 0.5 16 C 0.224 16 0 15.776 0 15.5 Z" fill="currentColor" style={styles.base} />
    <path d="M 3 7 C 3 5.895 3.895 5 5 5 L 12 5 C 13.105 5 14 5.895 14 7 L 14 9 C 14 10.105 13.105 11 12 11 L 5 11 C 3.895 11 3 10.105 3 9 Z" fill="currentColor" style={styles.base} />
  </svg>
);

interface FramerStylePanelProps {
  isOpen: boolean;
  onStyleChange?: (property: string, value: any) => void;
}

export default function FramerStylePanel({ isOpen, onStyleChange }: FramerStylePanelProps) {
  if (!isOpen) return null;

  const handleStyleUpdate = (property: string, value: any) => {
    onStyleChange?.(property, value);
  };

  return (
    <>
      <div className="panelContentStack_p1yy99cw" style={{
        ...styles.base, 
        ...styles.panelStack, 
        background: 'transparent',
        height: '100%'
      }}>
        <div className="panelContentWrapper_pfbd4j9" style={{...styles.base, ...styles.panelWrapper, background: 'transparent'}}>
          <div className="scroll_shr89u9 scrollVertical_s1i74306 withoutScrollbar_w1e16ne2" style={{...styles.base, ...styles.scroll, background: 'transparent', padding: '15px'}}>
            <div className="wrapper_w1pbb96s" style={{...styles.base, ...styles.wrapper, background: 'transparent'}}>
              
              {/* Alignment Toolbar */}
              <div className="style_s1dnyo6f" style={{...styles.base, ...styles.alignmentToolbar}}>
                <AlignmentButton title="Align Left AltA" isActive>
                  <AlignLeftIcon />
                </AlignmentButton>
                {/* Add other alignment buttons similarly */}
              </div>

              {/* Position Panel */}
              <div className="panel_p5inzda panelWithHeader_ptswoqr" style={{...styles.base, ...styles.panel}}>
                <PanelHeader title="Position" />
                
                <PanelRow title="">
                  <TextInput defaultValue="0" label="T" />
                  <div style={styles.base} />
                </PanelRow>

                <PanelRow title="">
                  <TextInput placeholder="0" label="L" />
                  {/* Pin Control Component */}
                  <div className="outerBox_o1s6ak9d" style={{
                    ...styles.base,
                    borderRadius: "8px",
                    position: "relative" as const,
                    paddingTop: "100%",
                    backgroundColor: "var(--framer-fresco-inputBackground-color, #f3f3f3)",
                  }}>
                    {/* Pin control content */}
                  </div>
                  <TextInput placeholder="0" label="R" />
                </PanelRow>

                <PanelRow title="">
                  <TextInput placeholder="0" label="B" />
                  <div style={styles.base} />
                </PanelRow>

                <PanelRow title="Type">
                  <select className="popupButton_p15qcods truncateWithEllipsis_t1295uka" style={{
                    ...styles.base,
                    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    overflow: "hidden",
                    whiteSpace: "nowrap" as const,
                    textOverflow: "ellipsis",
                    padding: "0px 16px 1px 7px",
                    border: "1px solid var(--framer-fresco-popupButtonBorder-color, transparent)",
                    borderRadius: "8px",
                    background: "var(--framer-fresco-inputBackground-color, #f3f3f3)",
                    width: "100%",
                    height: "30px",
                    appearance: "none",
                    color: "var(--framer-fresco-popupButtonText-color, #333333)",
                    fontSize: "var(--framer-fresco-base-font-size, 12px)",
                    fontWeight: "var(--framer-fresco-base-font-weight, 500)",
                    cursor: "pointer",
                    gridColumn: "2 / -1",
                  }}>
                    <option value="absolute">Absolute</option>
                    <option value="relative">Relative</option>
                    <option value="fixed" disabled>Fixed</option>
                    <option value="sticky">Sticky</option>
                  </select>
                </PanelRow>
              </div>

              {/* Size Panel */}
              <div className="panel_p5inzda panelWithHeader_ptswoqr" style={{...styles.base, ...styles.panel}}>
                <PanelHeader title="Size" isClickable />
                
                <PanelRow title="Width">
                  <TextInput defaultValue="100%" />
                  <SegmentedControl options={["Fixed", "Relative", "Fill", "Fit Content"]} selectedIndex={1} />
                </PanelRow>

                <PanelRow title="Height">
                  <TextInput defaultValue="100%" />
                  <SegmentedControl options={["Fixed", "Relative", "Fill", "Fit Content", "Viewport"]} selectedIndex={1} />
                </PanelRow>

                <PanelRow title="Min Max">
                  <div style={{...styles.base, gridColumn: "2 / -1"}}>
                    <div className="button_b11f2aom" style={{
                      ...styles.base,
                      border: "1px solid transparent",
                      borderRadius: "8px",
                      position: "relative" as const,
                      display: "flex",
                      height: "30px",
                      flexDirection: "row" as const,
                      alignItems: "center",
                      backgroundColor: "var(--framer-fresco-inputBackground-color, #f3f3f3)",
                      cursor: "pointer",
                      fontSize: "var(--framer-fresco-base-font-size, 12px)",
                      fontWeight: "var(--framer-fresco-base-font-weight, 500)",
                    }}>
                      <div className="iconWrapper_i1ab0gin" style={{
                        ...styles.base,
                        borderRadius: "4px",
                        display: "flex",
                        width: "22px",
                        height: "22px",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "8px",
                        marginLeft: "3px",
                        backgroundColor: "var(--framer-fresco-swatchBackground-color, #e6e6e6)",
                      }}>
                        {/* Icon content */}
                      </div>
                      <div className="truncateWithEllipsis_t1295uka titleWrapper_t1bkmsxp title_t8942cu" style={{
                        ...styles.base,
                        overflow: "hidden",
                        whiteSpace: "nowrap" as const,
                        textOverflow: "ellipsis",
                        display: "flex",
                        minWidth: "0px",
                        flexGrow: 1,
                        color: "var(--framer-fresco-inputLabel-color, #999999)",
                      }}>
                        Add…
                      </div>
                    </div>
                  </div>
                </PanelRow>
              </div>

              {/* Styles Panel */}
              <div className="panel_p5inzda panelWithHeader_ptswoqr" style={{...styles.base, ...styles.panel}}>
                <PanelHeader title="Styles" isClickable />
                
                <PanelRow title="Opacity">
                  <TextInput defaultValue="1" />
                  <input 
                    className="slider_s142amrw" 
                    type="range" 
                    defaultValue="1" 
                    max="1" 
                    min="0" 
                    step="0.01" 
                    tabIndex={-1}
                    onChange={(e) => handleStyleUpdate('opacity', e.target.value)}
                    style={{
                      ...styles.base,
                      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                      fontSize: "12px",
                      margin: "0px",
                      height: "30px",
                      appearance: "none",
                      backgroundColor: "transparent",
                      userSelect: "text" as const,
                    }} 
                  />
                </PanelRow>

                <PanelRow title="Visible">
                  <SegmentedControl 
                    options={["Yes", "No"]} 
                    selectedIndex={0} 
                    gridColumn="2 / -1"
                    onChange={(index, value) => handleStyleUpdate('visibility', value === 'Yes' ? 'visible' : 'hidden')}
                  />
                </PanelRow>

                <PanelRow title="Z Index">
                  <TextInput defaultValue="1" />
                  <SegmentedControl 
                    options={["-", "+"]} 
                    onChange={(index, value) => {
                      const currentZ = 1; // This would come from current state
                      const newZ = value === '+' ? currentZ + 1 : Math.max(0, currentZ - 1);
                      handleStyleUpdate('zIndex', newZ.toString());
                    }}
                  />
                </PanelRow>
              </div>

              {/* Transforms Panel */}
              <div className="panel_p5inzda panelWithHeader_ptswoqr" style={{...styles.base, ...styles.panel}}>
                <PanelHeader title="Transforms" isClickable />
                
                <PanelRow title="Rotate">
                  <TextInput defaultValue="0°" />
                  <SegmentedControl options={["2D", "3D"]} selectedIndex={0} />
                </PanelRow>
              </div>

              {/* God Rays Component Panel */}
              <div className="panel_p5inzda panelWithHeader_ptswoqr" style={{...styles.base, ...styles.panel}}>
                <PanelHeader title="God Rays" subtitle="Component" hasActions={false} />
                
                <PanelRow title="Preset">
                  <select style={{
                    ...styles.base,
                    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    overflow: "hidden",
                    whiteSpace: "nowrap" as const,
                    textOverflow: "ellipsis",
                    padding: "0px 16px 1px 7px",
                    border: "1px solid var(--framer-fresco-popupButtonBorder-color, transparent)",
                    borderRadius: "8px",
                    background: "var(--framer-fresco-inputBackground-color, #f3f3f3)",
                    width: "100%",
                    height: "30px",
                    appearance: "none",
                    color: "var(--framer-fresco-popupButtonText-color, #333333)",
                    fontSize: "var(--framer-fresco-base-font-size, 12px)",
                    fontWeight: "var(--framer-fresco-base-font-weight, 500)",
                    cursor: "pointer",
                    gridColumn: "2 / -1",
                  }}>
                    <option value="_string_Time Travel">Time Travel</option>
                    <option value="_string_Kinetic Field">Kinetic Field</option>
                    <option value="_string_Highway">Highway</option>
                    <option value="_string_Ocean">Ocean</option>
                    <option value="_string_Flowers">Flowers</option>
                    <option value="_string_Custom">Custom</option>
                  </select>
                </PanelRow>

                <PanelRow title="Color">
                  <SegmentedControl options={["Preset", "Custom"]} selectedIndex={1} gridColumn="2 / -1" />
                </PanelRow>

                <PanelRow title="Preview">
                  <SegmentedControl options={["Yes", "No"]} selectedIndex={0} gridColumn="2 / -1" />
                </PanelRow>

                <PanelRow title="">
                  <div className="inlineDocumentation_ia3rrjn description_d1ykgdi6 withMargin_w1wgf3m doubleColumnClass_dt2vdl5" style={{
                    ...styles.base,
                    color: "var(--framer-fresco-panelDescription-color, #999999)",
                    cursor: "default",
                    fontSize: "var(--framer-fresco-base-font-size, 12px)",
                    lineHeight: 1.6,
                    gridColumn: "2 / -1",
                    marginBottom: "10px",
                  }}>
                    More components at{" "}
                    <a href="https://frameruni.link/cc" target="_blank" style={{
                      ...styles.base,
                      color: "var(--framer-fresco-buttonBackgroundPrimary-color, #0099ff)",
                      textDecoration: "none",
                    }}>
                      Framer University
                    </a>
                    .
                  </div>
                </PanelRow>
              </div>

              {/* Empty Panels */}
              {["Effects", "Cursor", "Scroll Section", "Code Overrides"].map((title) => (
                <div key={title} className="panel_p5inzda emptyPanel_e14s1oge panelWithHeader_ptswoqr" style={{...styles.base, ...styles.panel, ...styles.emptyPanel}}>
                  <PanelHeader title={title} isClickable />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --framer-fresco-inputIconDisabled-color: #666666;
            --framer-fresco-tint-color: #0099ff;
            --framer-fresco-inputBorder-color: #18181b;
            --framer-fresco-inputBackground-color: #1a1a1a;
            --framer-fresco-inputText-color: #ffffff;
            --framer-fresco-base-font-size: 12px;
            --framer-fresco-base-font-weight: 500;
            --framer-fresco-heading-font-weight: 600;
            --framer-fresco-panelTitle-color: #ffffff;
            --framer-fresco-panelDivider-color: #18181b;
            --framer-fresco-panelRowTitle-color: #ffffff;
            --framer-fresco-inputIcon-color: #999999;
            --framer-fresco-inputLabel-color: #999999;
            --framer-fresco-labelSmall-font-size: 9px;
            --framer-fresco-label-font-size: 10px;
            --framer-fresco-segmentedControlBorder-color: #18181b;
            --framer-fresco-segmentedControlBackground-color: #1a1a1a;
            --framer-fresco-segmentedControlItemText-color: #999999;
            --framer-fresco-segmentedControlItemTextSelected-color: #0099ff;
            --framer-fresco-segmentedControlDivider-color: #18181b;
            --framer-fresco-panelSectionHeaderIcon-color: #ffffff;
            --framer-fresco-popupButtonText-color: #ffffff;
            --framer-fresco-dropdownText-color: #999999;
            --framer-fresco-panelDescription-color: #999999;
            --framer-fresco-buttonBackgroundPrimary-color: #0099ff;
            --framer-fresco-swatchBackground-color: #18181b;
          }
        `
      }} />
    </>
  );
}
