'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface HoneyPotFieldProps {
  control: any;
}

/** Hidden honeypot field to catch spam bots. */
export function HoneyPotField({ control }: HoneyPotFieldProps) {
  return (
    <FormField
      control={control}
      name={'honey_pot' as any}
      render={({ field }) => (
        <FormItem className="hidden">
          <FormLabel>Fax</FormLabel>
          <FormControl>
            <Input {...field} tabIndex={-1} autoComplete="off" />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
