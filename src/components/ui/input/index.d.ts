import { InputHTMLAttributes } from 'react';

declare const Input: React.ForwardRefExoticComponent<
  InputHTMLAttributes<HTMLInputElement> & {
    className?: string;
  } & React.RefAttributes<HTMLInputElement>
>;

export default Input;
