// Components bundle — 14 component(s) materialized from a .fig as one
// self-contained file: no imports/exports; every component is assigned to window below.
// Design tokens / typography still ship separately (fig-tokens.css / fig-typography.css).

// figma node: 873:22227 Progress chart
function ProgressChart(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: "fit-content",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      alignItems: "flex-start",
      flexWrap: "nowrap",
      position: "relative",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontWeight: 500,
      fontSize: 16,
      textAlign: "center",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      letterSpacing: "-0.009em",
      color: "rgb(255,255,255)",
      flexShrink: 0
    }
  }, props.text1 ?? "Credit limit"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 41,
      flexShrink: 0,
      alignSelf: "stretch"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 71.815,
      height: 18,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontWeight: 600,
      fontSize: 20,
      textAlign: "center",
      lineHeight: "18px",
      color: "rgb(255,255,255)"
    }
  }, props.text2 ?? "$4,430"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 307.208,
      top: 0,
      width: 80.792,
      height: 18,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontWeight: 600,
      fontSize: 20,
      textAlign: "center",
      lineHeight: "18px",
      color: "rgb(255,255,255)"
    }
  }, props.text3 ?? "$10,000"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 31,
      width: 388,
      height: 8,
      borderRadius: 2,
      backgroundColor: "rgb(30,30,36)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 29,
      width: 161,
      height: 12,
      borderRadius: 2,
      backgroundColor: "rgb(21,255,171)",
      boxShadow: "0px 4px 10px 0px rgba(40,188,0,0.34)"
    }
  })));
}

// figma node: 412:3719 Pie chart
function PieChart(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 208,
      height: 208,
      position: "relative",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 6,
      top: 6,
      width: 195,
      height: 195,
      borderRadius: "50%",
      backgroundColor: "rgb(0,0,0)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 208,
      height: 208
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 208,
      height: 208,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 6px rgb(72,7,234), 0px 100px 80px 0px rgba(5,84,255,0.28), 0px 64.815px 46.852px 0px rgba(5,84,255,0.2126), 0px 38.519px 25.481px 0px rgba(5,84,255,0.1701), 0px 20px 13px 0px rgba(5,84,255,0.14), 0px 8.148px 6.519px 0px rgba(5,84,255,0.1099), 0px 1.852px 3.148px 0px rgba(5,84,255,0.0674)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 208,
      height: 208,
      borderRadius: "50%",
      backgroundColor: "rgb(10,175,255)",
      boxShadow: "inset 0 0 0 6px rgb(21,255,171), 0px 100px 80px 0px rgba(56,255,228,0.22), 0px 64.815px 46.852px 0px rgba(56,255,228,0.167), 0px 38.519px 25.481px 0px rgba(56,255,228,0.1336), 0px 20px 13px 0px rgba(56,255,228,0.11), 0px 8.148px 6.519px 0px rgba(56,255,228,0.0864), 0px 1.852px 3.148px 0px rgba(56,255,228,0.053)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 208,
      height: 208,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 6px rgb(232,15,233)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 29,
      top: 29,
      width: 148,
      height: 148,
      borderRadius: "50%",
      backgroundColor: "rgb(21,20,25)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 38,
      top: 75,
      width: 130,
      height: 30,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontWeight: 700,
      fontSize: 24,
      textAlign: "center",
      lineHeight: "100%",
      letterSpacing: "0.113px",
      color: "rgb(255,255,255)"
    }
  }, props.text1 ?? "$22,870"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 42,
      top: 112,
      width: 122,
      height: 31,
      fontFamily: "Roboto, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 14,
      textAlign: "center",
      lineHeight: "100%",
      letterSpacing: "0.097px",
      color: "rgb(105,105,116)"
    }
  }, props.text2 ?? "Total expenses per month"));
}

// figma node: 635:7396 Candle chart
function CandleChart(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 24,
      height: 24,
      overflow: "hidden",
      position: "relative",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 24,
      height: 24
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0 0 L 24 0 L 24 24 L 0 24 L 0 0 Z",
    fill: "currentColor",
    fillRule: "evenodd"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 18,
    height: 20,
    viewBox: "0 0 18 20",
    fill: "none",
    style: {
      position: "absolute",
      left: 3,
      top: 2,
      width: 18,
      height: 20,
      color: "rgb(0,0,0)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 5 3 L 8 3 L 8 12 L 5 12 L 5 15 L 3 15 L 3 12 L 0 12 L 0 3 L 3 3 L 3 0 L 5 0 L 5 3 Z M 15 8 L 18 8 L 18 17 L 15 17 L 15 20 L 13 20 L 13 17 L 10 17 L 10 8 L 13 8 L 13 5 L 15 5 L 15 8 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })));
}

// figma node: 635:6948 avalanche avax
function AvalancheAvax(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 24,
      height: 24,
      overflow: "hidden",
      position: "relative",
      color: "rgb(232,65,66)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 24,
      height: 24
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 24 12 C 24 18.627 18.627 24 12 24 C 5.373 24 0 18.627 0 12 C 0 5.373 5.373 0 12 0 C 18.627 0 24 5.373 24 12 Z M 17.735 12.312 C 17.32 11.594 16.649 11.594 16.233 12.312 L 13.597 16.857 C 13.19 17.575 13.531 18.161 14.353 18.161 L 19.568 18.161 C 20.4 18.161 20.74 17.575 20.324 16.857 L 17.735 12.312 Z M 12.718 3.562 C 12.302 2.844 11.641 2.844 11.225 3.562 L 3.675 16.857 C 3.26 17.584 3.6 18.161 4.431 18.161 L 8.22 18.161 C 8.986 18.113 9.675 17.707 10.091 17.065 L 14.655 9.156 C 14.986 8.476 14.986 7.672 14.655 6.992 L 13.294 4.602 L 12.718 3.562 Z",
    fill: "currentColor",
    fillRule: "evenodd"
  })));
}

// figma node: 635:6949 Bitcoin btc
function BitcoinBtc(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 24,
      height: 24,
      overflow: "hidden",
      position: "relative",
      color: "rgb(247,147,26)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 23.997,
    height: 24,
    viewBox: "0 0 23.997 24",
    fill: "none",
    style: {
      position: "absolute",
      left: -0.022,
      top: 0.017,
      width: 23.997,
      height: 24
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 9.095 23.641 C 15.524 25.244 22.036 21.331 23.638 14.903 L 23.638 14.903 L 23.638 14.903 C 25.241 8.474 21.329 1.962 14.9 0.359 C 8.473 -1.244 1.961 2.669 0.359 9.098 C -1.244 15.526 2.668 22.038 9.095 23.641 Z M 14.67 7.245 C 16.333 7.818 17.548 8.676 17.31 10.273 L 17.31 10.273 L 17.31 10.273 C 17.137 11.442 16.489 12.008 15.629 12.207 C 16.81 12.822 17.411 13.765 16.839 15.4 C 16.128 17.431 14.44 17.602 12.194 17.177 L 11.649 19.361 L 10.332 19.033 L 10.87 16.879 C 10.529 16.794 10.18 16.704 9.821 16.606 L 9.281 18.771 L 7.966 18.443 L 8.511 16.255 C 8.384 16.223 8.257 16.189 8.129 16.156 C 7.945 16.108 7.76 16.06 7.572 16.013 L 5.858 15.585 L 6.512 14.078 C 6.512 14.078 7.482 14.336 7.469 14.317 C 7.842 14.409 8.007 14.166 8.073 14.004 L 8.934 10.552 C 8.968 10.56 9.002 10.569 9.035 10.577 C 9.048 10.58 9.06 10.583 9.073 10.586 C 9.02 10.565 8.973 10.552 8.936 10.542 L 9.55 8.078 C 9.566 7.798 9.47 7.445 8.937 7.312 C 8.957 7.298 7.98 7.074 7.98 7.074 L 8.331 5.668 L 10.147 6.122 L 10.145 6.128 C 10.418 6.196 10.699 6.261 10.986 6.326 L 11.525 4.163 L 12.841 4.492 L 12.313 6.612 C 12.666 6.692 13.021 6.774 13.368 6.86 L 13.893 4.754 L 15.209 5.082 L 14.67 7.245 Z M 10.505 15.088 C 11.579 15.372 13.928 15.992 14.301 14.492 L 14.301 14.492 C 14.684 12.958 12.407 12.447 11.295 12.198 C 11.171 12.17 11.061 12.145 10.971 12.123 L 10.248 15.022 C 10.322 15.04 10.408 15.063 10.505 15.088 Z M 11.518 10.852 C 12.414 11.091 14.368 11.613 14.708 10.249 L 14.708 10.249 C 15.056 8.855 13.157 8.434 12.229 8.229 C 12.125 8.206 12.033 8.186 11.958 8.167 L 11.302 10.796 C 11.364 10.811 11.437 10.831 11.518 10.852 Z",
    fill: "currentColor",
    fillRule: "evenodd"
  })));
}

// figma node: 635:6950 Cardano ada
function CardanoAda(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 25.974,
      height: 24,
      overflow: "hidden",
      position: "relative",
      color: "rgb(0,51,173)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: -0.001,
      top: -0.001,
      width: 25.975,
      height: 24.002,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 25.975,
      height: 24.002,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 3.501,
    height: 3.498,
    viewBox: "0 0 3.501 3.498",
    fill: "none",
    style: {
      position: "absolute",
      left: 7.118,
      top: 10.259,
      width: 3.501,
      height: 3.498
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.003 1.655 C -0.052 2.618 0.689 3.442 1.651 3.498 C 1.686 3.498 1.721 3.498 1.755 3.498 C 2.725 3.498 3.508 2.715 3.501 1.745 C 3.501 0.776 2.718 -0.007 1.748 0 C 0.82 0 0.051 0.727 0.003 1.655 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.131,
    height: 1.131,
    viewBox: "0 0 1.131 1.131",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 11.463,
      width: 1.131,
      height: 1.131
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.596 0.001 C 0.285 -0.02 0.014 0.223 0.001 0.535 C -0.013 0.846 0.222 1.116 0.534 1.13 C 0.846 1.151 1.109 0.909 1.13 0.597 C 1.15 0.285 0.908 0.022 0.596 0.001 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.131,
    height: 1.133,
    viewBox: "0 0 1.131 1.133",
    fill: "none",
    style: {
      position: "absolute",
      left: 6.188,
      top: 0.689,
      width: 1.131,
      height: 1.133
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.822 1.071 C 1.099 0.932 1.209 0.586 1.071 0.309 C 0.932 0.032 0.586 -0.079 0.309 0.06 C 0.032 0.198 -0.079 0.538 0.06 0.815 C 0.198 1.099 0.538 1.216 0.822 1.071 C 0.815 1.071 0.822 1.071 0.822 1.071 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.743,
    height: 1.743,
    viewBox: "0 0 1.743 1.743",
    fill: "none",
    style: {
      position: "absolute",
      left: 7.52,
      top: 3.206,
      width: 1.743,
      height: 1.743
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 1.263 1.651 C 1.692 1.436 1.865 0.909 1.651 0.48 C 1.436 0.051 0.909 -0.123 0.48 0.092 C 0.051 0.307 -0.123 0.833 0.092 1.263 C 0.307 1.692 0.833 1.865 1.263 1.651 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.441,
    height: 1.438,
    viewBox: "0 0 1.441 1.438",
    fill: "none",
    style: {
      position: "absolute",
      left: 2.486,
      top: 5.661,
      width: 1.441,
      height: 1.438
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.327 1.322 C 0.66 1.536 1.103 1.446 1.325 1.114 C 1.539 0.781 1.449 0.338 1.117 0.116 C 0.784 -0.098 0.341 -0.008 0.119 0.324 C -0.102 0.657 -0.005 1.107 0.327 1.322 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.748,
    height: 1.748,
    viewBox: "0 0 1.748 1.748",
    fill: "none",
    style: {
      position: "absolute",
      left: 2.95,
      top: 11.151,
      width: 1.748,
      height: 1.748
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.923 0.001 C 0.438 -0.026 0.029 0.341 0.001 0.826 C -0.026 1.311 0.341 1.719 0.826 1.747 C 1.311 1.775 1.719 1.408 1.747 0.923 C 1.775 0.445 1.408 0.029 0.923 0.001 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.443,
    height: 1.443,
    viewBox: "0 0 1.443 1.443",
    fill: "none",
    style: {
      position: "absolute",
      left: 2.514,
      top: 16.942,
      width: 1.443,
      height: 1.443
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.396 0.077 C 0.043 0.258 -0.103 0.687 0.077 1.047 C 0.258 1.4 0.687 1.546 1.047 1.366 C 1.4 1.186 1.546 0.756 1.366 0.396 C 1.186 0.043 0.749 -0.103 0.396 0.077 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 2.055,
    height: 2.055,
    viewBox: "0 0 2.055 2.055",
    fill: "none",
    style: {
      position: "absolute",
      left: 5.837,
      top: 7.458,
      width: 2.055,
      height: 2.055
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.467 1.887 C 0.945 2.198 1.582 2.067 1.887 1.589 C 2.198 1.111 2.067 0.474 1.589 0.169 C 1.111 -0.143 0.474 -0.011 0.169 0.467 C -0.143 0.938 -0.011 1.575 0.467 1.887 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.752,
    height: 1.747,
    viewBox: "0 0 1.752 1.747",
    fill: "none",
    style: {
      position: "absolute",
      left: 16.677,
      top: 3.183,
      width: 1.752,
      height: 1.747
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.397 1.604 C 0.799 1.867 1.346 1.757 1.609 1.355 C 1.872 0.953 1.761 0.406 1.36 0.143 C 0.958 -0.12 0.411 -0.01 0.148 0.392 C -0.123 0.801 -0.012 1.341 0.397 1.604 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.130,
    height: 1.135,
    viewBox: "0 0 1.130 1.135",
    fill: "none",
    style: {
      position: "absolute",
      left: 18.607,
      top: 0.663,
      width: 1.13,
      height: 1.135
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.254 1.042 C 0.518 1.215 0.864 1.139 1.037 0.876 C 1.21 0.613 1.134 0.266 0.871 0.093 C 0.608 -0.08 0.261 -0.004 0.088 0.253 C -0.078 0.516 -0.002 0.869 0.254 1.042 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 3.494,
    height: 3.494,
    viewBox: "0 0 3.494 3.494",
    fill: "none",
    style: {
      position: "absolute",
      left: 15.36,
      top: 10.242,
      width: 3.494,
      height: 3.494
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 1.845 0.003 C 0.883 -0.052 0.051 0.689 0.003 1.651 C -0.052 2.614 0.689 3.445 1.651 3.494 C 1.686 3.494 1.721 3.494 1.748 3.494 C 2.711 3.494 3.494 2.711 3.494 1.741 C 3.501 0.82 2.773 0.051 1.845 0.003 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 3.499,
    height: 3.506,
    viewBox: "0 0 3.499 3.506",
    fill: "none",
    style: {
      position: "absolute",
      left: 9.17,
      top: 6.676,
      width: 3.499,
      height: 3.506
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.189 2.544 C 0.486 3.132 1.089 3.506 1.754 3.506 C 2.717 3.506 3.499 2.724 3.499 1.754 C 3.499 1.484 3.437 1.214 3.312 0.964 C 2.876 0.099 1.823 -0.248 0.964 0.189 C 0.099 0.632 -0.248 1.685 0.189 2.544 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.442,
    height: 1.438,
    viewBox: "0 0 1.442 1.438",
    fill: "none",
    style: {
      position: "absolute",
      left: 22.015,
      top: 5.623,
      width: 1.442,
      height: 1.438
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 1.051 1.36 C 1.404 1.18 1.543 0.744 1.363 0.391 C 1.183 0.037 0.746 -0.101 0.393 0.079 C 0.04 0.259 -0.099 0.688 0.074 1.042 C 0.261 1.395 0.691 1.54 1.051 1.36 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 2.055,
    height: 2.052,
    viewBox: "0 0 2.055 2.052",
    fill: "none",
    style: {
      position: "absolute",
      left: 18.066,
      top: 7.43,
      width: 2.055,
      height: 2.052
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.567 0.107 C 0.061 0.363 -0.146 0.98 0.11 1.485 C 0.366 1.991 0.983 2.199 1.488 1.942 C 1.994 1.686 2.202 1.07 1.945 0.564 C 1.689 0.058 1.073 -0.142 0.567 0.107 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.443,
    height: 1.443,
    viewBox: "0 0 1.443 1.443",
    fill: "none",
    style: {
      position: "absolute",
      left: 12.239,
      top: 0,
      width: 1.443,
      height: 1.443
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.68 1.442 C 1.075 1.462 1.414 1.158 1.442 0.763 C 1.469 0.368 1.158 0.029 0.763 0.001 C 0.368 -0.02 0.029 0.278 0.001 0.673 C -0.02 1.075 0.285 1.414 0.68 1.442 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 2.053,
    height: 2.054,
    viewBox: "0 0 2.053 2.054",
    fill: "none",
    style: {
      position: "absolute",
      left: 11.94,
      top: 3.912,
      width: 2.053,
      height: 2.054
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.971 2.052 C 1.539 2.087 2.024 1.65 2.051 1.082 C 2.086 0.514 1.65 0.03 1.082 0.002 C 0.514 -0.033 0.029 0.404 0.001 0.972 C -0.026 1.54 0.403 2.024 0.971 2.052 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 2.055,
    height: 2.055,
    viewBox: "0 0 2.055 2.055",
    fill: "none",
    style: {
      position: "absolute",
      left: 5.854,
      top: 14.52,
      width: 2.055,
      height: 2.055
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 1.488 1.945 C 1.994 1.689 2.202 1.073 1.945 0.567 C 1.689 0.061 1.073 -0.146 0.567 0.11 C 0.061 0.366 -0.146 0.983 0.11 1.488 C 0.366 1.994 0.983 2.202 1.488 1.945 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 3.493,
    height: 3.492,
    viewBox: "0 0 3.493 3.492",
    fill: "none",
    style: {
      position: "absolute",
      left: 13.291,
      top: 6.678,
      width: 3.493,
      height: 3.492
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.285 0.79 C -0.241 1.6 -0.02 2.681 0.791 3.207 C 1.601 3.733 2.682 3.512 3.208 2.701 C 3.735 1.891 3.513 0.81 2.702 0.284 C 2.419 0.097 2.086 0 1.747 0 C 1.158 0 0.611 0.298 0.285 0.79 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 3.502,
    height: 3.501,
    viewBox: "0 0 3.502 3.501",
    fill: "none",
    style: {
      position: "absolute",
      left: 13.305,
      top: 13.818,
      width: 3.502,
      height: 3.501
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 3.312 0.964 C 2.876 0.099 1.823 -0.248 0.964 0.189 C 0.099 0.625 -0.248 1.678 0.189 2.537 C 0.625 3.402 1.678 3.749 2.537 3.312 C 3.396 2.883 3.749 1.844 3.319 0.978 C 3.319 0.971 3.319 0.971 3.312 0.964 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 2.055,
    height: 2.055,
    viewBox: "0 0 2.055 2.055",
    fill: "none",
    style: {
      position: "absolute",
      left: 18.083,
      top: 14.488,
      width: 2.055,
      height: 2.055
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 1.589 0.169 C 1.111 -0.143 0.474 -0.011 0.169 0.467 C -0.143 0.945 -0.011 1.582 0.467 1.887 C 0.945 2.198 1.582 2.067 1.887 1.589 C 2.198 1.118 2.067 0.481 1.589 0.169 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.748,
    height: 1.748,
    viewBox: "0 0 1.748 1.748",
    fill: "none",
    style: {
      position: "absolute",
      left: 21.277,
      top: 11.109,
      width: 1.748,
      height: 1.748
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 1.747 0.923 C 1.775 0.438 1.408 0.029 0.923 0.001 C 0.438 -0.026 0.029 0.341 0.001 0.826 C -0.026 1.311 0.341 1.719 0.826 1.747 C 1.304 1.775 1.719 1.401 1.747 0.923 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.130,
    height: 1.131,
    viewBox: "0 0 1.130 1.131",
    fill: "none",
    style: {
      position: "absolute",
      left: 24.845,
      top: 11.407,
      width: 1.13,
      height: 1.131
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.596 0.001 C 0.285 -0.02 0.014 0.223 0.001 0.535 C -0.013 0.846 0.222 1.116 0.534 1.13 C 0.846 1.151 1.109 0.909 1.13 0.597 C 1.143 0.285 0.908 0.022 0.596 0.001 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.441,
    height: 1.438,
    viewBox: "0 0 1.441 1.438",
    fill: "none",
    style: {
      position: "absolute",
      left: 22.049,
      top: 16.903,
      width: 1.441,
      height: 1.438
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 1.114 0.116 C 0.781 -0.098 0.338 -0.008 0.116 0.324 C -0.098 0.657 -0.008 1.1 0.324 1.322 C 0.657 1.536 1.1 1.446 1.322 1.114 C 1.543 0.781 1.446 0.331 1.114 0.116 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.133,
    height: 1.129,
    viewBox: "0 0 1.133 1.129",
    fill: "none",
    style: {
      position: "absolute",
      left: 6.231,
      top: 22.204,
      width: 1.133,
      height: 1.129
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.876 0.093 C 0.613 -0.08 0.266 -0.004 0.093 0.253 C -0.08 0.516 -0.004 0.862 0.253 1.035 C 0.516 1.208 0.862 1.132 1.035 0.876 C 1.215 0.62 1.139 0.266 0.876 0.093 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.131,
    height: 1.133,
    viewBox: "0 0 1.131 1.133",
    fill: "none",
    style: {
      position: "absolute",
      left: 18.656,
      top: 22.179,
      width: 1.131,
      height: 1.133
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.309 0.063 C 0.032 0.201 -0.079 0.547 0.06 0.824 C 0.198 1.101 0.544 1.212 0.822 1.074 C 1.099 0.935 1.209 0.596 1.071 0.319 C 0.932 0.035 0.593 -0.083 0.309 0.063 C 0.316 0.063 0.309 0.063 0.309 0.063 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 3.503,
    height: 3.499,
    viewBox: "0 0 3.503 3.499",
    fill: "none",
    style: {
      position: "absolute",
      left: 9.181,
      top: 13.825,
      width: 3.503,
      height: 3.499
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 3.218 2.709 C 3.745 1.899 3.523 0.819 2.712 0.285 C 1.902 -0.241 0.822 -0.02 0.288 0.791 C -0.245 1.601 -0.017 2.682 0.794 3.215 C 1.078 3.402 1.41 3.499 1.75 3.499 C 2.345 3.506 2.893 3.208 3.218 2.709 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.752,
    height: 1.747,
    viewBox: "0 0 1.752 1.747",
    fill: "none",
    style: {
      position: "absolute",
      left: 7.546,
      top: 19.072,
      width: 1.752,
      height: 1.747
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 1.355 0.143 C 0.953 -0.12 0.406 -0.01 0.143 0.392 C -0.12 0.794 -0.01 1.341 0.392 1.604 C 0.794 1.867 1.341 1.757 1.604 1.355 C 1.874 0.953 1.764 0.406 1.355 0.143 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.443,
    height: 1.443,
    viewBox: "0 0 1.443 1.443",
    fill: "none",
    style: {
      position: "absolute",
      left: 12.217,
      top: 22.559,
      width: 1.443,
      height: 1.443
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.764 0.001 C 0.369 -0.02 0.029 0.285 0.002 0.68 C -0.026 1.075 0.286 1.414 0.681 1.442 C 1.075 1.462 1.415 1.165 1.442 0.77 C 1.463 0.368 1.158 0.029 0.764 0.001 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 2.054,
    height: 2.053,
    viewBox: "0 0 2.054 2.053",
    fill: "none",
    style: {
      position: "absolute",
      left: 11.905,
      top: 18.035,
      width: 2.054,
      height: 2.053
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 1.082 0.002 C 0.514 -0.033 0.03 0.404 0.002 0.972 C -0.033 1.54 0.404 2.024 0.972 2.052 C 1.54 2.08 2.024 1.65 2.052 1.082 C 2.087 0.521 1.65 0.03 1.082 0.002 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1.754,
    height: 1.750,
    viewBox: "0 0 1.754 1.750",
    fill: "none",
    style: {
      position: "absolute",
      left: 16.714,
      top: 19.05,
      width: 1.754,
      height: 1.75
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.478 0.095 C 0.048 0.317 -0.125 0.843 0.097 1.273 C 0.318 1.702 0.845 1.875 1.274 1.654 C 1.704 1.439 1.877 0.913 1.662 0.483 C 1.44 0.054 0.914 -0.126 0.478 0.095 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })))));
}

// figma node: 635:7013 Ethereum eth
function EthereumEth(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 24,
      height: 24,
      overflow: "hidden",
      position: "relative",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 4.629,
      top: 0,
      width: 14.739,
      height: 24,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 14.739,
      height: 24,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 14.739,
      height: 24,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 7.527,
    height: 16.577,
    viewBox: "0 0 7.527 16.577",
    fill: "none",
    style: {
      position: "absolute",
      left: 7.207,
      top: 0,
      width: 7.527,
      height: 16.577,
      color: "rgb(52,52,52)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.161 0 L 0 0.547 L 0 16.416 L 0.161 16.577 L 7.527 12.223 L 0.161 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 7.366,
    height: 16.577,
    viewBox: "0 0 7.366 16.577",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 7.366,
      height: 16.577,
      color: "rgb(140,140,140)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 7.366 0 L 0 12.223 L 7.366 16.577 L 7.366 8.874 L 7.366 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 7.461,
    height: 10.380,
    viewBox: "0 0 7.461 10.380",
    fill: "none",
    style: {
      position: "absolute",
      left: 7.277,
      top: 13.619,
      width: 7.461,
      height: 10.38,
      color: "rgb(60,60,59)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0.091 4.352 L 0 4.463 L 0 10.115 L 0.091 10.38 L 7.461 0 L 0.091 4.352 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 7.366,
    height: 10.380,
    viewBox: "0 0 7.366 10.380",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 13.619,
      width: 7.366,
      height: 10.38,
      color: "rgb(140,140,140)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 7.366 10.38 L 7.366 4.352 L 0 0 L 7.366 10.38 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 7.366,
    height: 7.702,
    viewBox: "0 0 7.366 7.702",
    fill: "none",
    style: {
      position: "absolute",
      left: 7.371,
      top: 8.874,
      width: 7.366,
      height: 7.702,
      color: "rgb(20,20,20)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0 7.702 L 7.366 3.348 L 0 0 L 0 7.702 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 7.366,
    height: 7.702,
    viewBox: "0 0 7.366 7.702",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 8.874,
      width: 7.366,
      height: 7.702,
      color: "rgb(57,57,57)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0 3.348 L 7.366 7.702 L 7.366 0 L 0 3.348 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  }))))));
}

// figma node: 635:6946 Near protocol
function NearProtocol(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 24,
      height: 24,
      overflow: "hidden",
      position: "relative",
      color: "rgb(0,0,0)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 24,
      height: 24
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 19.232 1.227 L 14.224 8.667 C 13.878 9.173 14.544 9.787 15.023 9.36 L 19.951 5.067 C 20.084 4.96 20.271 5.04 20.271 5.227 L 20.271 18.64 C 20.271 18.827 20.031 18.907 19.925 18.773 L 5.008 0.907 C 4.528 0.32 3.836 0 3.063 0 L 2.531 0 C 1.145 0 0 1.147 0 2.56 L 0 21.44 C 0 22.853 1.145 24 2.557 24 C 3.436 24 4.262 23.547 4.741 22.773 L 9.749 15.333 C 10.095 14.827 9.43 14.213 8.95 14.64 L 4.022 18.907 C 3.889 19.013 3.703 18.933 3.703 18.747 L 3.703 5.36 C 3.703 5.173 3.942 5.093 4.049 5.227 L 18.966 23.093 C 19.445 23.68 20.164 24 20.91 24 L 21.443 24 C 22.855 24 24 22.853 24 21.44 L 24 2.56 C 24 1.147 22.855 0 21.443 0 C 20.537 0 19.711 0.453 19.232 1.227 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })));
}

// figma node: 635:6947 stacks
function Stacks(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 24,
      height: 24,
      overflow: "hidden",
      position: "relative",
      color: "rgb(85,70,255)",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 24,
      height: 24
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 24 12 C 24 18.627 18.627 24 12 24 C 5.373 24 0 18.627 0 12 C 0 5.373 5.373 0 12 0 C 18.627 0 24 5.373 24 12 Z M 14.313 14.268 L 16.896 18.323 L 14.974 18.323 L 11.94 13.562 L 8.906 18.323 L 6.984 18.323 L 9.567 14.268 L 5.857 14.268 L 5.857 12.736 L 18.023 12.736 L 18.023 14.268 L 14.313 14.268 Z M 18.023 9.717 L 18.023 11.249 L 5.857 11.264 L 5.857 9.717 L 9.492 9.717 L 6.939 5.707 L 8.876 5.707 L 11.94 10.543 L 15.004 5.707 L 16.941 5.707 L 14.388 9.717 L 18.023 9.717 Z",
    fill: "currentColor",
    fillRule: "evenodd"
  })));
}

// figma node: 873:22859 Bubble chart
function BubbleChart(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 740,
      height: 711.284,
      position: "relative",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: -201.015,
      top: 57.433,
      width: 1142.03,
      height: 596.418,
      borderRadius: "50%",
      background: "radial-gradient(571.015px 298.209px at 50.00% 50.00%, rgba(97,30,215,0.3) 0.00%, rgba(42,14,91,0) 100.00%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 109.343,
      top: 89.463,
      width: 532.358,
      height: 532.358,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 1.104px rgb(37,37,37)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      transform: "matrix(-1,0,0,1,533.463,125.910)",
      transformOrigin: "0 0",
      width: 19.881,
      height: 19.881,
      borderRadius: "50%",
      backgroundColor: "rgb(0,0,0)",
      boxShadow: "inset 0 0 0 1.104px rgb(37,37,37)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      transform: "matrix(-1,0,0,1,356.746,609.672)",
      transformOrigin: "0 0",
      width: 19.881,
      height: 19.881,
      borderRadius: "50%",
      backgroundColor: "rgb(0,0,0)",
      boxShadow: "inset 0 0 0 1.104px rgb(37,37,37)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      transform: "matrix(-1,0,0,1,171.194,191.075)",
      transformOrigin: "0 0",
      width: 19.881,
      height: 19.881,
      borderRadius: "50%",
      backgroundColor: "rgb(0,0,0)",
      boxShadow: "inset 0 0 0 1.104px rgb(37,37,37)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 19.881,
      top: 0,
      width: 711.284,
      height: 711.284,
      borderRadius: "50%"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      transform: "matrix(-1,0,0,1,740,373.313)",
      transformOrigin: "0 0",
      width: 19.881,
      height: 19.881,
      borderRadius: "50%",
      backgroundColor: "rgb(7,2,16)",
      boxShadow: "inset 0 0 0 1.104px rgb(20,20,38)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 269.559,
      top: 242.605,
      width: 25.089,
      height: 24.505,
      borderRadius: "50%",
      background: "radial-gradient(25.794px 25.194px at 70.40% 31.20%, rgb(50,68,232) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(3,0,146),rgb(3,0,146))",
      boxShadow: "0px 2.334px 46.677px 0px rgb(35,0,248), inset 0px 1.167px 5.835px 0px rgba(255,255,255,0.58), inset 5.835px 9.335px 11.669px 0px rgba(130,5,255,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 79.643,
      top: 337.563,
      width: 25.089,
      height: 24.505,
      opacity: 0.6,
      borderRadius: "50%",
      background: "radial-gradient(25.794px 25.194px at 70.40% 31.20%, rgb(112,112,112) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(66,66,66),rgb(66,66,66))",
      boxShadow: "0px 2.334px 46.677px 0px rgba(209,209,209,0.45), inset 0px 1.167px 5.835px 0px rgba(255,255,255,0.18), inset 5.835px 9.335px 11.669px 0px rgba(81,80,81,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 659,
      top: 368,
      width: 25.089,
      height: 24.505,
      opacity: 0.6,
      borderRadius: "50%",
      background: "radial-gradient(25.794px 25.194px at 70.40% 31.20%, rgb(112,112,112) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(66,66,66),rgb(66,66,66))",
      boxShadow: "0px 2.334px 46.677px 0px rgba(209,209,209,0.45), inset 0px 1.167px 5.835px 0px rgba(255,255,255,0.18), inset 5.835px 9.335px 11.669px 0px rgba(81,80,81,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 421.697,
      top: 224.226,
      width: 12.253,
      height: 12.253,
      borderRadius: "50%",
      background: "radial-gradient(12.597px 12.597px at 70.40% 31.20%, rgb(112,112,112) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(66,66,66),rgb(66,66,66))",
      boxShadow: "0px 2.334px 46.677px 0px rgb(209,209,209), inset 0px 1.167px 5.835px 0px rgba(255,255,255,0.18), inset 5.835px 9.335px 11.669px 0px rgba(81,80,81,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 377.792,
      top: 548.922,
      width: 25.089,
      height: 24.505,
      opacity: 0.6,
      borderRadius: "50%",
      background: "radial-gradient(25.794px 25.194px at 70.40% 31.20%, rgb(112,112,112) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(66,66,66),rgb(66,66,66))",
      boxShadow: "0px 2.334px 46.677px 0px rgba(209,209,209,0.45), inset 0px 1.167px 5.835px 0px rgba(255,255,255,0.18), inset 5.835px 9.335px 11.669px 0px rgba(81,80,81,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 333.886,
      top: 466.216,
      width: 64.327,
      height: 62.831,
      borderRadius: "50%",
      background: "radial-gradient(66.135px 64.597px at 70.40% 31.20%, rgb(50,68,232) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(3,0,146),rgb(3,0,146))",
      boxShadow: "0px 5.984px 119.677px 0px rgb(35,0,248), inset 0px 2.992px 14.960px 0px rgba(255,255,255,0.58), inset 14.960px 23.935px 29.919px 0px rgba(130,5,255,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 467.645,
      top: 221.162,
      width: 72.495,
      height: 72.495,
      borderRadius: "50%",
      background: "radial-gradient(74.533px 74.533px at 70.40% 31.20%, rgb(50,68,232) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(3,0,146),rgb(3,0,146))",
      boxShadow: "0px 4.418px 88.358px 0px rgba(248,0,119,0.48), inset 0px 2.209px 11.045px 0px rgba(255,255,255,0.58), inset 11.045px 22.090px 33.134px 0px rgb(255,5,5)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 628.972,
      top: 211.973,
      width: 72.495,
      height: 72.495,
      borderRadius: "50%",
      background: "radial-gradient(74.533px 74.533px at 70.40% 31.20%, rgb(50,68,232) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(3,0,146),rgb(3,0,146))",
      boxShadow: "0px 4.084px 81.685px 0px rgb(35,0,248), inset 0px 2.042px 10.211px 0px rgba(255,255,255,0.58), inset 10.211px 16.337px 20.421px 0px rgba(130,5,255,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 58.201,
      top: 236.478,
      width: 52.074,
      height: 52.074,
      borderRadius: "50%",
      background: "radial-gradient(53.538px 53.538px at 70.40% 31.20%, rgb(50,68,232) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(3,0,146),rgb(3,0,146))",
      boxShadow: "0px 4.418px 88.358px 0px rgba(248,0,119,0.48), inset 0px 2.209px 11.045px 0px rgba(255,255,255,0.58), inset 11.045px 22.090px 55.224px 0px rgb(255,5,5)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 383.511,
      width: 72.495,
      height: 72.495,
      borderRadius: "50%",
      background: "radial-gradient(74.533px 74.533px at 70.40% 31.20%, rgb(50,68,232) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(3,0,146),rgb(3,0,146))",
      boxShadow: "0px 4.084px 81.685px 0px rgb(35,0,248), inset 0px 2.042px 10.211px 0px rgba(255,255,255,0.58), inset 10.211px 16.337px 20.421px 0px rgba(130,5,255,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 641.225,
      top: 466.216,
      width: 72.495,
      height: 72.495,
      borderRadius: "50%",
      background: "radial-gradient(74.533px 74.533px at 70.40% 31.20%, rgb(50,68,232) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(3,0,146),rgb(3,0,146))",
      boxShadow: "0px 4.084px 81.685px 0px rgb(35,0,248), inset 0px 2.042px 10.211px 0px rgba(255,255,255,0.58), inset 10.211px 16.337px 20.421px 0px rgba(130,5,255,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 340.179,
      top: 155.731,
      width: 75.104,
      height: 75.104
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 75.104,
      height: 75.104,
      borderRadius: "50%",
      background: "radial-gradient(77.216px 77.216px at 70.40% 31.20%, rgb(50,68,232) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(3,0,146),rgb(3,0,146))",
      boxShadow: "0px 4.084px 81.685px 0px rgb(35,0,248), inset 0px 2.042px 10.211px 0px rgba(255,255,255,0.58), inset 10.211px 16.337px 20.421px 0px rgba(130,5,255,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 19.881,
      top: 19.881,
      width: 35.343,
      height: 35.343,
      borderRadius: "50%",
      backgroundColor: "rgb(16,15,20)",
      boxShadow: "0px 102.106px 81.685px 0px rgba(3,2,41,0.24), 0px 42.657px 34.126px 0px rgba(3,2,41,0.1725), 0px 22.807px 18.245px 0px rgba(3,2,41,0.1431), 0px 12.785px 10.228px 0px rgba(3,2,41,0.12), 0px 6.790px 5.432px 0px rgba(3,2,41,0.0969), 0px 2.826px 2.260px 0px rgba(3,2,41,0.0675)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 28.717,
      top: 28.716,
      width: 17.672,
      height: 17.672
    }
  }, props.icon1 ?? /*#__PURE__*/React.createElement(BitcoinBtc, {
    style: {
      transform: "scale(0.736, 0.736)",
      transformOrigin: "0 0"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 135.851,
      top: 234.149,
      width: 128.119,
      height: 128.119
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 128.119,
      height: 128.119,
      borderRadius: "50%",
      background: "radial-gradient(131.722px 131.722px at 70.40% 31.20%, rgb(163,232,50) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(0,93,146),rgb(0,93,146))",
      boxShadow: "0px 3.687px 73.734px 0px rgba(0,248,99,0.41), inset 0px 1.843px 9.217px 0px rgba(255,255,255,0.58), inset 9.217px 14.747px 18.433px 0px rgba(40,255,5,0.46)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 27.612,
      top: 27.612,
      width: 72.896,
      height: 72.896,
      borderRadius: "50%",
      backgroundColor: "rgb(16,15,20)",
      boxShadow: "0px 113.805px 91.044px 0px rgba(1,25,11,0.52), 0px 47.545px 38.036px 0px rgba(1,25,11,0.3738), 0px 25.420px 20.336px 0px rgba(1,25,11,0.31), 0px 14.250px 11.400px 0px rgba(1,25,11,0.26), 0px 7.568px 6.055px 0px rgba(1,25,11,0.21), 0px 3.149px 2.519px 0px rgba(1,25,11,0.1462)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 35.327,
      top: 35.76,
      width: 57.433,
      height: 57.433
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 10.822,
      top: 34.09,
      width: 36,
      height: 12,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 10,
      textAlign: "center",
      lineHeight: "12.149px",
      letterSpacing: "0.050em",
      color: "rgb(245,245,255)",
      textTransform: "capitalize"
    }
  }, props.text1 ?? "83%"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 57.433,
      height: 57.433,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 3.378px rgb(64,64,74)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 57.433,
      height: 57.433,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 3.378px rgb(255,231,11), 0px 110.448px 88.358px 0px rgba(255,159,28,0.32), 0px 46.142px 36.914px 0px rgba(255,159,28,0.23), 0px 24.670px 19.736px 0px rgba(255,159,28,0.1908), 0px 13.830px 11.064px 0px rgba(255,159,28,0.16), 0px 7.345px 5.876px 0px rgba(255,159,28,0.1292), 0px 3.056px 2.445px 0px rgba(255,159,28,0.09)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 19.897,
      top: 11.732,
      width: 17.672,
      height: 17.672
    }
  }, props.icon2 ?? /*#__PURE__*/React.createElement(AvalancheAvax, {
    style: {
      transform: "scale(0.736, 0.736)",
      transformOrigin: "0 0"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 275.686,
      top: 246.689,
      width: 203.667,
      height: 203.667,
      boxShadow: "-134.377px 165.780px 281.812px 0px rgba(61,4,67,0.68), -111.754px 137.871px 165.043px 0px rgba(61,4,67,0.5163), -94.847px 117.012px 89.762px 0px rgba(61,4,67,0.413), -82.941px 102.323px 45.794px 0px rgba(61,4,67,0.34), -75.320px 92.923px 22.962px 0px rgba(61,4,67,0.267), -71.272px 87.928px 11.090px 0px rgba(61,4,67,0.1637)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0.434,
      top: -0.39,
      width: 205.433,
      height: 205.433,
      borderRadius: "50%",
      background: "radial-gradient(211.209px 211.209px at 70.40% 31.20%, rgb(50,68,232) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(3,0,146),rgb(3,0,146))",
      boxShadow: "inset 0px 2.042px 10.211px 0px rgba(255,255,255,0.58), inset 10.211px 20.421px 102.106px 0px rgb(219,0,255)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 50.135,
      top: 49.311,
      width: 106.03,
      height: 106.03,
      borderRadius: "50%",
      backgroundColor: "rgb(16,15,20)",
      boxShadow: "0px 102.106px 81.685px 0px rgba(3,2,41,0.24), 0px 42.657px 34.126px 0px rgba(3,2,41,0.1725), 0px 22.807px 18.245px 0px rgba(3,2,41,0.1431), 0px 12.785px 10.228px 0px rgba(3,2,41,0.12), 0px 6.790px 5.432px 0px rgba(3,2,41,0.0969), 0px 2.826px 2.260px 0px rgba(3,2,41,0.0675)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 62.285,
      top: 61.46,
      width: 81.685,
      height: 81.685
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 81.685,
      height: 81.685,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 4.418px rgb(64,64,74)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 81.685,
      height: 81.685,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 4.418px rgb(6,215,246), 0px 102.106px 81.685px 0px rgba(11,83,244,0.23), 0px 42.657px 34.126px 0px rgba(11,83,244,0.1653), 0px 22.807px 18.245px 0px rgba(11,83,244,0.1371), 0px 12.785px 10.228px 0px rgba(11,83,244,0.115), 0px 6.790px 5.432px 0px rgba(11,83,244,0.0929), 0px 2.826px 2.260px 0px rgba(11,83,244,0.0647)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 14.275,
      top: 45.564,
      width: 54.119,
      height: 16.567,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 14,
      textAlign: "center",
      lineHeight: "100%",
      color: "rgb(245,245,255)"
    }
  }, props.text2 ?? "80%"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 27.528,
      top: 14.638,
      width: 26.507,
      height: 26.507
    }
  }, props.icon3 ?? /*#__PURE__*/React.createElement(EthereumEth, {
    style: {
      transform: "scale(1.104, 1.104)",
      transformOrigin: "0 0"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 98.021,
      top: 370.237,
      width: 197.064,
      height: 197.064
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0.277,
      top: -0.237,
      width: 196.597,
      height: 196.597,
      borderRadius: "50%",
      background: "radial-gradient(202.125px 202.125px at 70.40% 31.20%, rgb(232,181,50) 0.00%, rgba(0,2,16,0) 100.00%), linear-gradient(rgb(146,26,0),rgb(146,26,0))",
      boxShadow: "0px 3.687px 73.734px 0px rgb(248,59,0), inset 0px 1.843px 9.217px 0px rgba(255,255,255,0.58), inset 9.217px 14.747px 18.433px 0px rgba(255,125,5,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 51.083,
      top: 50.569,
      width: 94.985,
      height: 94.985,
      borderRadius: "50%",
      backgroundColor: "rgb(16,15,20)",
      boxShadow: "0px 102.106px 81.685px 0px rgba(92,7,7,0.46), 0px 42.657px 34.126px 0px rgba(92,7,7,0.3307), 0px 22.807px 18.245px 0px rgba(92,7,7,0.2742), 0px 12.785px 10.228px 0px rgba(92,7,7,0.23), 0px 6.790px 5.432px 0px rgba(92,7,7,0.1858), 0px 2.826px 2.260px 0px rgba(92,7,7,0.1293)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 61.023,
      top: 60.509,
      width: 75.104,
      height: 75.104
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 14.955,
      top: 45.254,
      width: 46,
      height: 17,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 14,
      textAlign: "center",
      lineHeight: "100%",
      color: "rgb(245,245,255)"
    }
  }, props.text3 ?? "51%"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 75.104,
      height: 75.104,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 4.418px rgb(64,64,74)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 75.104,
      height: 75.104,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 4.418px rgb(98,247,131), 0px 7.345px 5.876px 0px rgba(34,255,64,0.1494), 0px 3.056px 2.445px 0px rgba(34,255,64,0.104)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 24.298,
      top: 13.254,
      width: 26.507,
      height: 26.507
    }
  }, props.icon4 ?? /*#__PURE__*/React.createElement(Stacks, {
    style: {
      transform: "scale(1.104, 1.104)",
      transformOrigin: "0 0"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 426.802,
      top: 424.353,
      width: 146.079,
      height: 144.674
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0.631,
      top: -0.234,
      width: 145.791,
      height: 145.791,
      borderRadius: "50%",
      background: "radial-gradient(149.890px 149.890px at 70.40% 31.20%, rgb(232,50,50) 0.00%, rgba(135,136,149,0) 100.00%), linear-gradient(rgb(148,0,0),rgb(148,0,0))",
      boxShadow: "0px 3.687px 73.734px 0px rgb(248,0,0), inset 0px 1.843px 9.217px 0px rgba(255,255,255,0.58), inset 9.217px 14.747px 18.433px 0px rgba(255,5,5,0.95)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 39.288,
      top: 37.319,
      width: 69.582,
      height: 69.582,
      borderRadius: "50%",
      backgroundColor: "rgb(16,15,20)",
      boxShadow: "0px 102.106px 81.685px 0px rgba(92,7,7,0.46), 0px 42.657px 34.126px 0px rgba(92,7,7,0.3307), 0px 22.807px 18.245px 0px rgba(92,7,7,0.2742), 0px 12.785px 10.228px 0px rgba(92,7,7,0.23), 0px 6.790px 5.432px 0px rgba(92,7,7,0.1858), 0px 2.826px 2.260px 0px rgba(92,7,7,0.1293)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 47.019,
      top: 46.154,
      width: 53.015,
      height: 53.015
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 53.015,
      height: 53.015,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 3.378px rgb(64,64,74)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 53.015,
      height: 53.015,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 4.418px rgb(6,202,231), 0px 102.106px 81.685px 0px rgba(11,83,244,0.23), 0px 42.657px 34.126px 0px rgba(11,83,244,0.1653), 0px 22.807px 18.245px 0px rgba(11,83,244,0.1371), 0px 12.785px 10.228px 0px rgba(11,83,244,0.115), 0px 6.790px 5.432px 0px rgba(11,83,244,0.0929), 0px 2.826px 2.260px 0px rgba(11,83,244,0.0647)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 14.358,
      top: 15.463,
      width: 24.299,
      height: 22.09
    }
  }, /*#__PURE__*/React.createElement(CardanoAda, {
    style: {
      transform: "scale(0.936, 0.920)",
      transformOrigin: "0 0"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 497.015,
      top: 308.149,
      width: 101.085,
      height: 100.113
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 101.612,
      height: 101.612,
      borderRadius: "50%",
      background: "radial-gradient(104.469px 104.469px at 70.40% 31.20%, rgb(50,188,232) 0.00%, rgba(135,136,149,0) 100.00%), linear-gradient(rgb(26,83,193),rgb(26,83,193))",
      boxShadow: "0px 2.551px 51.023px 0px rgb(54,129,218), inset 0px 1.276px 6.378px 0px rgba(255,255,255,0.58), inset 6.378px 10.205px 12.756px 0px rgba(160,246,252,0.63)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 26.508,
      top: 26.507,
      width: 48.597,
      height: 48.597,
      borderRadius: "50%",
      backgroundColor: "rgb(16,15,20)",
      boxShadow: "0px 102.106px 81.685px 0px rgba(3,2,41,0.24), 0px 42.657px 34.126px 0px rgba(3,2,41,0.1725), 0px 22.807px 18.245px 0px rgba(3,2,41,0.1431), 0px 12.785px 10.228px 0px rgba(3,2,41,0.12), 0px 6.790px 5.432px 0px rgba(3,2,41,0.0969), 0px 2.826px 2.260px 0px rgba(3,2,41,0.0675)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 43.075,
      top: 43.075,
      width: 15.463,
      height: 15.463
    }
  }, /*#__PURE__*/React.createElement(NearProtocol, {
    style: {
      transform: "scale(0.644, 0.644)",
      transformOrigin: "0 0"
    }
  }))));
}

// figma node: 873:24843 Hex graph
function HexGraph(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 1063,
      height: 134,
      position: "relative",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 1063,
      height: 80.322
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 6,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(23,107,248)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 23.563,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(23,107,248)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 41.126,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 58.688,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(23,107,248)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 76.252,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 93.815,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 111.378,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 128.941,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 146.505,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 164.067,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 181.63,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 199.193,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 216.757,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(37,36,93)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 234.319,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 251.883,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 269.446,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 287.009,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 304.571,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 322.135,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 339.698,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 357.261,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 374.824,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 392.388,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 409.95,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 427.513,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 445.076,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 462.64,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 480.202,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 497.766,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 515.329,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 532.892,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 550.454,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 568.018,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 585.581,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 603.144,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 620.707,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 638.271,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 655.833,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 673.396,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 690.959,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 708.522,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 726.085,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 743.648,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 761.212,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 778.774,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 796.337,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 813.9,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 831.464,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 849.026,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 866.59,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 884.152,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 901.716,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(255,135,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 919.278,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(255,135,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 936.842,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 954.405,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(255,135,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 971.968,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(255,135,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 14.781,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(23,107,248)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 32.345,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(23,107,248)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 49.907,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 67.471,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 85.034,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 102.597,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 120.159,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 137.723,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 155.286,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 172.849,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 190.412,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 207.976,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 225.538,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 243.101,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 260.664,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(37,36,93)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 278.228,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 295.79,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 313.354,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 330.917,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 348.479,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 366.042,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 383.605,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 401.169,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 418.731,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 436.295,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 453.858,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 471.421,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 488.983,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 506.547,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 524.11,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 541.673,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 559.236,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 576.799,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 594.362,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 611.925,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 629.488,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 647.052,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 664.614,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 682.178,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 699.741,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 717.304,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 734.866,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 752.43,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 769.993,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 787.556,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 805.119,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 822.682,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 840.245,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 857.808,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(255,135,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 875.371,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 892.935,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 910.497,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(255,135,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 928.061,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 945.623,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 963.187,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 6,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(23,107,248)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 23.563,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(23,107,248)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 41.126,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(23,107,248)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 58.688,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 76.252,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 93.815,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 111.378,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 128.941,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 146.505,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 164.067,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 181.63,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 199.193,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 216.757,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 234.319,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 251.883,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(37,36,93)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 269.446,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 287.009,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 304.571,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(37,36,93)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 322.135,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 339.698,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 357.261,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 374.824,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 392.388,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 409.95,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 427.513,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 445.076,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 462.64,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 480.202,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 497.766,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 515.329,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 532.892,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 550.454,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 568.018,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 585.581,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 603.144,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 620.707,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 638.271,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 655.833,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 673.396,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 690.959,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 708.522,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 726.085,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 743.648,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 761.212,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 778.774,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 796.337,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 813.9,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 831.464,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 849.026,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 866.59,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 884.152,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 901.716,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 919.278,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 936.842,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 954.405,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(255,135,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 971.968,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 14.781,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 32.345,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(23,107,248)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 49.907,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(23,107,248)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 67.471,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 85.034,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 102.597,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 120.159,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 137.723,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 155.286,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 172.849,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 190.412,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 207.976,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 225.538,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 243.101,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 260.664,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 278.228,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 295.79,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 313.354,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 330.917,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 348.479,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 366.042,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 383.605,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 401.169,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 418.731,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 436.295,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 453.858,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 471.421,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 488.983,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 506.547,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 524.11,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 541.673,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 559.236,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 576.799,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 594.362,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 611.925,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 629.488,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 647.052,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 664.614,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 682.178,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 699.741,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 717.304,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 734.866,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 752.43,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 769.993,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 787.556,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 805.119,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 822.682,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 840.245,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 857.808,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 875.371,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 892.935,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 910.497,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 928.061,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 945.623,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 963.187,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 6,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 23.563,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(23,107,248)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 41.126,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 58.688,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 76.252,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 93.815,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 111.378,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 128.941,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 146.505,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 164.067,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 181.63,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 199.193,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(37,36,93)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 216.757,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 234.319,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 251.883,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 269.446,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 287.009,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 304.571,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 322.135,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(56,61,202)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 339.698,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(37,36,93)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 357.261,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 374.824,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 392.388,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 409.95,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 427.513,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 445.076,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 462.64,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 480.202,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 497.766,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 515.329,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 532.892,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 550.454,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 568.018,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 585.581,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 603.144,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 620.707,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(30,30,36)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 638.271,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 655.833,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 673.396,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 690.959,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 708.522,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 726.085,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 743.648,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 761.212,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 778.774,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 796.337,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 813.9,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 831.464,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 849.026,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 866.59,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 884.152,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 901.716,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 919.278,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 936.842,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 954.405,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 971.968,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 989.747,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(255,135,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1007.311,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1024.874,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(255,135,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1042.437,
      top: 0,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 980.966,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 998.529,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1016.093,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1033.655,
      top: 15.368,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 989.747,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1007.311,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1024.874,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1042.437,
      top: 30.735,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 980.966,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 998.529,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(119,36,67)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1016.093,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1033.655,
      top: 46.103,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 989.747,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1007.311,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1024.874,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 15.368,
    height: 18.661,
    viewBox: "0 0 15.368 18.661",
    fill: "none",
    style: {
      position: "absolute",
      left: 1042.437,
      top: 61.471,
      width: 15.368,
      height: 18.661,
      color: "rgb(219,48,49)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 15.368 4.526 L 7.664 0 L 0 4.526 L 0 13.878 L 7.664 18.661 L 15.368 13.878 L 15.368 4.526 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 1,
      top: 97,
      width: 1040.593,
      height: 36.682
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 4.536,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 36.834,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 69.131,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 101.428,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 133.725,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 166.021,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 199.241,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 231.538,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 263.835,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 296.133,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 328.43,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 360.726,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 393.023,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 425.32,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 457.617,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 489.914,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 523.134,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 555.432,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 587.728,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 620.024,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 652.322,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 684.619,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 716.915,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 749.213,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 781.51,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 813.807,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 847.026,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 879.323,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 911.621,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 976,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 943.917,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 1008.296,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 1,
    height: 6.459,
    viewBox: "-0.500 0 1 6.459",
    fill: "none",
    style: {
      position: "absolute",
      left: 1040.593,
      top: 0,
      width: 1,
      height: 6.459,
      color: "rgb(44,44,53)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M -0.5 0 L -0.5 6.459 L 0.5 6.459 L 0.5 0 L -0.5 0 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      top: 18.227,
      width: 8.305,
      height: 18.455,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 12,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      color: "rgb(112,112,124)"
    }
  }, props.text1 ?? "0"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 104.273,
      top: 18.227,
      width: 15.687,
      height: 18.455,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 12,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      color: "rgb(112,112,124)"
    }
  }, props.text2 ?? "25"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 232.538,
      top: 18.227,
      width: 15.687,
      height: 18.455,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 12,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      color: "rgb(112,112,124)"
    }
  }, props.text3 ?? "50"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 361.726,
      top: 18.227,
      width: 15.687,
      height: 18.455,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 12,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      color: "rgb(112,112,124)"
    }
  }, props.text4 ?? "75"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 491.837,
      top: 18.227,
      width: 23.069,
      height: 18.455,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 12,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      color: "rgb(112,112,124)"
    }
  }, "100"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 621.024,
      top: 18.227,
      width: 23.069,
      height: 18.455,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 12,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      color: "rgb(112,112,124)"
    }
  }, "125"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 750.213,
      top: 18.227,
      width: 23.069,
      height: 18.455,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 12,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      color: "rgb(112,112,124)"
    }
  }, "150"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 881.246,
      top: 18.227,
      width: 23.069,
      height: 18.455,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 12,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      color: "rgb(112,112,124)"
    }
  }, "175"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 1012,
      top: 18.227,
      width: 23.069,
      height: 18.455,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 12,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      color: "rgb(112,112,124)"
    }
  }, "200")));
}

// figma node: 627:6489 Indicator
function Indicator(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: "fit-content",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      alignItems: "flex-start",
      flexWrap: "nowrap",
      position: "relative",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
      flexWrap: "nowrap",
      flexShrink: 0,
      alignSelf: "stretch"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 80,
      height: 80,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 80,
      height: 80,
      borderRadius: "50%",
      backgroundColor: "rgb(0,0,0)",
      boxShadow: "inset 0 0 0 6px rgb(36,36,36)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 18,
      top: 31,
      width: 44,
      height: 19,
      fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontWeight: 300,
      fontSize: 21.749998092651367,
      textAlign: "center",
      lineHeight: "100%",
      letterSpacing: "0.102px",
      color: "rgb(255,255,255)"
    }
  }, props.text1 ?? "27%"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 80,
      height: 80,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 6px rgb(85,0,254), 0px 100px 80px 0px rgba(11,83,244,0.23), 0px 41.778px 33.422px 0px rgba(11,83,244,0.1653), 0px 22.336px 17.869px 0px rgba(11,83,244,0.1371), 0px 12.522px 10.017px 0px rgba(11,83,244,0.115), 0px 6.650px 5.320px 0px rgba(11,83,244,0.0929), 0px 2.767px 2.214px 0px rgba(11,83,244,0.0647)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 94,
      display: "flex",
      flexDirection: "column",
      gap: 4,
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "nowrap",
      flexShrink: 0,
      alignSelf: "stretch"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      fontFamily: "Roboto, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 18.124998092651367,
      textAlign: "left",
      lineHeight: "29px",
      letterSpacing: "0.399px",
      color: "rgb(255,255,255)",
      flexShrink: 0,
      whiteSpace: "nowrap"
    }
  }, props.text2 ?? "92,980"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontWeight: 300,
      fontSize: 14.499999046325684,
      textAlign: "left",
      lineHeight: "21.750px",
      letterSpacing: "0.399px",
      color: "rgb(255,255,255)",
      flexShrink: 0,
      whiteSpace: "nowrap"
    }
  }, props.text3 ?? "Active users"))));
}

// figma node: 416:3700 Car
function Car(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 24,
      height: 24,
      overflow: "hidden",
      position: "relative",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 24,
      height: 24
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 0 0 L 24 0 L 24 24 L 0 24 L 0 0 Z",
    fill: "currentColor",
    fillRule: "evenodd"
  })), /*#__PURE__*/React.createElement("svg", {
    width: 24,
    height: 18,
    viewBox: "0 0 24 18",
    fill: "none",
    style: {
      position: "absolute",
      left: 0,
      top: 4,
      width: 24,
      height: 18,
      color: "rgb(255,255,255)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 22 9.5 L 22 17 C 22 17.265 21.895 17.52 21.707 17.707 C 21.52 17.895 21.265 18 21 18 L 20 18 C 19.735 18 19.48 17.895 19.293 17.707 C 19.105 17.52 19 17.265 19 17 L 19 16 L 5 16 L 5 17 C 5 17.265 4.895 17.52 4.707 17.707 C 4.52 17.895 4.265 18 4 18 L 3 18 C 2.735 18 2.48 17.895 2.293 17.707 C 2.105 17.52 2 17.265 2 17 L 2 9.5 L 0.757 9.19 C 0.541 9.136 0.349 9.011 0.212 8.835 C 0.075 8.659 0 8.443 0 8.22 L 0 7.5 C 0 7.367 0.053 7.24 0.146 7.146 C 0.24 7.053 0.367 7 0.5 7 L 2.375 7 L 4.513 1.298 C 4.656 0.917 4.912 0.588 5.247 0.356 C 5.581 0.124 5.979 0 6.386 0 L 17.614 0 C 18.021 0 18.419 0.124 18.753 0.356 C 19.088 0.588 19.344 0.917 19.487 1.298 L 21.625 7 L 23.5 7 C 23.633 7 23.76 7.053 23.854 7.146 C 23.947 7.24 24 7.367 24 7.5 L 24 8.22 C 24 8.443 23.925 8.659 23.788 8.835 C 23.651 9.011 23.459 9.136 23.243 9.19 L 22 9.5 Z M 4 11 L 4 13 C 4 13.265 4.105 13.52 4.293 13.707 C 4.48 13.895 4.735 14 5 14 L 8.245 14 C 8.331 14 8.416 13.977 8.491 13.935 C 8.566 13.892 8.629 13.831 8.673 13.757 C 8.718 13.682 8.742 13.598 8.744 13.512 C 8.746 13.425 8.726 13.34 8.685 13.264 C 7.88 11.754 6.318 11 4 11 Z M 20 11 C 17.683 11 16.121 11.755 15.314 13.264 C 15.273 13.34 15.253 13.426 15.255 13.512 C 15.257 13.598 15.281 13.683 15.326 13.757 C 15.37 13.831 15.433 13.892 15.508 13.935 C 15.584 13.978 15.669 14 15.755 14 L 19 14 C 19.265 14 19.52 13.895 19.707 13.707 C 19.895 13.52 20 13.265 20 13 L 20 11 Z M 6 2 L 4.439 6.684 C 4.389 6.834 4.375 6.994 4.399 7.151 C 4.423 7.307 4.484 7.456 4.576 7.585 C 4.669 7.713 4.791 7.818 4.932 7.89 C 5.073 7.962 5.229 8 5.387 8 L 18.613 8 C 18.771 8 18.927 7.962 19.068 7.89 C 19.209 7.818 19.331 7.713 19.424 7.585 C 19.516 7.456 19.577 7.307 19.601 7.151 C 19.625 6.994 19.611 6.834 19.561 6.684 L 18 2 L 6 2 Z",
    fill: "currentColor",
    fillRule: "nonzero"
  })));
}

// figma node: 416:3690 Mini indicator
function MiniIndicator(_p = {}) {
  const props = _p;
  return /*#__PURE__*/React.createElement("div", {
    className: props.className,
    style: {
      width: 240,
      height: 50,
      position: "relative",
      ...props.style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 136.5,
      height: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 50,
      height: 50,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 3px rgb(30,30,36)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 50,
      height: 50,
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 3px rgb(85,1,254)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 16,
      top: 16,
      width: 18,
      height: 18
    }
  }, props.icon1 ?? /*#__PURE__*/React.createElement(Car, {
    style: {
      transform: "scale(0.750, 0.750)",
      transformOrigin: "0 0"
    }
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 68.5,
      top: 7,
      width: 62,
      height: 16,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 14,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      color: "rgb(169,169,183)"
    }
  }, props.text1 ?? "Sport car"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 68.5,
      top: 27,
      display: "flex",
      flexDirection: "row",
      gap: 6,
      alignItems: "flex-start",
      flexWrap: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontWeight: 700,
      fontSize: 16,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "16px",
      letterSpacing: "-0.009em",
      color: "rgb(241,240,246)",
      flexShrink: 0
    }
  }, props.text2 ?? "$45,000"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 39,
      height: 19,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      top: 1,
      width: 39,
      height: 16,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
      fontSize: 12,
      textAlign: "left",
      whiteSpace: "nowrap",
      lineHeight: "100%",
      color: "rgb(56,253,182)"
    }
  }, props.text3 ?? "↑2.5%"))));
}

// Globals for scripts loaded after this file.
window.ProgressChart = ProgressChart;
window.PieChart = PieChart;
window.CandleChart = CandleChart;
window.AvalancheAvax = AvalancheAvax;
window.BitcoinBtc = BitcoinBtc;
window.CardanoAda = CardanoAda;
window.EthereumEth = EthereumEth;
window.NearProtocol = NearProtocol;
window.Stacks = Stacks;
window.BubbleChart = BubbleChart;
window.HexGraph = HexGraph;
window.Indicator = Indicator;
window.Car = Car;
window.MiniIndicator = MiniIndicator;