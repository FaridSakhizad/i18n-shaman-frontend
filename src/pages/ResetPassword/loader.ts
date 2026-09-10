import { redirect } from 'react-router-dom';
import { validateResetToken } from '../../api/user';
import { isApiError } from '../../api/errors';

export default async function resetPasswordLoader({ params }: any) {
  const { resetToken } = params;

  if (!resetToken || resetToken.length < 1) {
    return redirect('/');
  }

  const result = await validateResetToken(resetToken as string);

  if (isApiError(result) || !result.success) {
    return redirect('/');
  }

  return true;
}
