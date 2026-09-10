// Components.d.ts — the complete catalog of the 14 component(s) in
// Components.bundle.js. READ THIS FILE BEFORE USING THE BUNDLE: component
// names are derived from Figma layer names (sanitized to PascalCase,
// deduplicated) and may differ from what the design calls them — the
// "figma layer" comment above each interface maps them back.
// After the bundle <script> loads, every component is a window global
// (e.g. window.AvalancheAvax) and usable directly in JSX.
import * as React from 'react';

// figma layer: "avalanche avax" (node 635:6948)
export interface AvalancheAvaxProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Bitcoin btc" (node 635:6949)
export interface BitcoinBtcProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Bubble chart" (node 873:22859)
export interface BubbleChartProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "83%". */
  text1?: string;
  /** Text content; defaults to "80%". */
  text2?: string;
  /** Text content; defaults to "51%". */
  text3?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon2?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon3?: React.ReactNode;
  /** Swappable nested instance; defaults to the design's. */
  icon4?: React.ReactNode;
}

// figma layer: "Candle chart" (node 635:7396)
export interface CandleChartProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Car" (node 416:3700)
export interface CarProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Cardano ada" (node 635:6950)
export interface CardanoAdaProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Ethereum eth" (node 635:7013)
export interface EthereumEthProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Hex graph" (node 873:24843)
export interface HexGraphProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "0". */
  text1?: string;
  /** Text content; defaults to "25". */
  text2?: string;
  /** Text content; defaults to "50". */
  text3?: string;
  /** Text content; defaults to "75". */
  text4?: string;
}

// figma layer: "Indicator" (node 627:6489)
export interface IndicatorProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "27%". */
  text1?: string;
  /** Text content; defaults to "92,980". */
  text2?: string;
  /** Text content; defaults to "Active users". */
  text3?: string;
}

// figma layer: "Mini indicator" (node 416:3690)
export interface MiniIndicatorProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Sport car". */
  text1?: string;
  /** Text content; defaults to "$45,000". */
  text2?: string;
  /** Text content; defaults to "↑2.5%". */
  text3?: string;
  /** Swappable nested instance; defaults to the design's. */
  icon1?: React.ReactNode;
}

// figma layer: "Near protocol" (node 635:6946)
export interface NearProtocolProps {
  className?: string;
  style?: React.CSSProperties;
}

// figma layer: "Pie chart" (node 412:3719)
export interface PieChartProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "$22,870". */
  text1?: string;
  /** Text content; defaults to "Total expenses per month". */
  text2?: string;
}

// figma layer: "Progress chart" (node 873:22227)
export interface ProgressChartProps {
  className?: string;
  style?: React.CSSProperties;
  /** Text content; defaults to "Credit limit". */
  text1?: string;
  /** Text content; defaults to "$4,430". */
  text2?: string;
  /** Text content; defaults to "$10,000". */
  text3?: string;
}

// figma layer: "stacks" (node 635:6947)
export interface StacksProps {
  className?: string;
  style?: React.CSSProperties;
}

declare const AvalancheAvax: React.FC<AvalancheAvaxProps>;
declare const BitcoinBtc: React.FC<BitcoinBtcProps>;
declare const BubbleChart: React.FC<BubbleChartProps>;
declare const CandleChart: React.FC<CandleChartProps>;
declare const Car: React.FC<CarProps>;
declare const CardanoAda: React.FC<CardanoAdaProps>;
declare const EthereumEth: React.FC<EthereumEthProps>;
declare const HexGraph: React.FC<HexGraphProps>;
declare const Indicator: React.FC<IndicatorProps>;
declare const MiniIndicator: React.FC<MiniIndicatorProps>;
declare const NearProtocol: React.FC<NearProtocolProps>;
declare const PieChart: React.FC<PieChartProps>;
declare const ProgressChart: React.FC<ProgressChartProps>;
declare const Stacks: React.FC<StacksProps>;
declare global {
  interface Window {
    AvalancheAvax: React.FC<AvalancheAvaxProps>;
    BitcoinBtc: React.FC<BitcoinBtcProps>;
    BubbleChart: React.FC<BubbleChartProps>;
    CandleChart: React.FC<CandleChartProps>;
    Car: React.FC<CarProps>;
    CardanoAda: React.FC<CardanoAdaProps>;
    EthereumEth: React.FC<EthereumEthProps>;
    HexGraph: React.FC<HexGraphProps>;
    Indicator: React.FC<IndicatorProps>;
    MiniIndicator: React.FC<MiniIndicatorProps>;
    NearProtocol: React.FC<NearProtocolProps>;
    PieChart: React.FC<PieChartProps>;
    ProgressChart: React.FC<ProgressChartProps>;
    Stacks: React.FC<StacksProps>;
  }
}
