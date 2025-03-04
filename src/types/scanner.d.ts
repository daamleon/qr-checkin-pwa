declare module "react-qr-scanner" {
  import { Component } from "react";

  interface QrScannerProps {
    delay?: number;
    onScan?: (data: string | null) => void;
    onError?: (error: any) => void;
    constraints?: MediaStreamConstraints;
    style?: React.CSSProperties;
  }

  class QrScanner extends Component<QrScannerProps> {}

  export default QrScanner;
}
