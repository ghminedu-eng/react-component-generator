import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

describe('PromptInput', () => {
  it('500자 초과 시 오류와 글자 수를 표시하고 생성 버튼을 비활성화한다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '가'.repeat(501) } });

    expect(screen.getByRole('alert')).toHaveTextContent('프롬프트는 500자 이하로 입력해주세요.');
    expect(screen.getByText('501 / 500자')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/프롬프트는 500자 이하로 입력해주세요/);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it.each(['Control', 'Meta'])('500자 초과 시 %s+Enter로도 제출하지 않는다', async (modifier) => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '가'.repeat(501) } });
    input.focus();
    await user.keyboard(`{${modifier}>}{Enter}{/${modifier}}`);
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('초과 입력을 500자로 줄이면 오류가 해제되고 제출할 수 있다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '가'.repeat(501) } });
    fireEvent.change(input, { target: { value: '가'.repeat(500) } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('500 / 500자')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
    expect(onGenerate).toHaveBeenCalledExactlyOnceWith('가'.repeat(500));
  });

  it('프롬프트가 비어 있으면 생성 버튼이 비활성이다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('입력하면 버튼이 활성화되고 클릭 시 입력값으로 onGenerate가 호출된다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await user.type(screen.getByRole('textbox'), '프로필 카드');
    const submit = screen.getByRole('button', { name: '컴포넌트 생성' });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onGenerate).toHaveBeenCalledWith('프로필 카드');
  });

  it('로딩 중에는 생성 버튼이 비활성이고 "생성 중..." 을 보여준다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled();
  });
});
