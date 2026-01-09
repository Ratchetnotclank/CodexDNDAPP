type PreviewProps = {
  text: string;
};

export default function Preview({ text }: PreviewProps) {
  return <div className="preview">{text}</div>;
}
