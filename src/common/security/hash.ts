import bcrypt from "bcrypt";

export const Globalhash = ({ plainText }: { plainText: string }) => {
  return bcrypt.hashSync(plainText, 10);
};

export const GlobalCompare = ({
  plainText,
  hashText,
}: {
  plainText: string;
  hashText: string;
}) => {
  return bcrypt.compareSync(plainText, hashText);
};
