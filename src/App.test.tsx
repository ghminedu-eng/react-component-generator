import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

vi.mock('./components/LivePreview', () => ({ LivePreview: () => <div>preview</div> }));

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
    ok: true,
    json: async () => url === '/api/config'
      ? { envKeys: { google: false, anthropic: false } }
      : { code: 'render(<div>Hello</div>)' },
  })));
});
afterEach(() => vi.unstubAllGlobals());

it('새로고침 후 연결 설정, 프롬프트 히스토리와 생성 결과를 복원한다', async () => {
  const first = render(<App />);
  fireEvent.change(screen.getByLabelText('AI 제공자'), { target: { value: 'anthropic' } });
  fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'test-key' } });
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '프로필 카드' } });
  fireEvent.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
  await screen.findByText('preview');
  first.unmount();

  const restored = render(<App />);
  expect(screen.getByLabelText('AI 제공자')).toHaveValue('anthropic');
  expect(screen.getByLabelText('API Key')).toHaveValue('test-key');
  expect(screen.getByText('preview')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '프로필 카드' }));
  expect(screen.getByRole('textbox')).toHaveValue('프로필 카드');
  fireEvent.click(screen.getByRole('button', { name: /^삭제$/ }));
  await waitFor(() => expect(screen.queryByText('preview')).not.toBeInTheDocument());
  restored.unmount();
  render(<App />);
  expect(screen.queryByText('preview')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '프로필 카드' })).toBeInTheDocument();
});

it('잘못된 저장 데이터는 기본값으로 복구한다', () => {
  window.localStorage.setItem('component-studio.api-key', '{broken');
  window.localStorage.setItem('component-studio.provider', '"unknown"');
  window.localStorage.setItem('component-studio.components', JSON.stringify([
    { id: 'bad', prompt: 'bad', code: 'bad', createdAt: 'invalid' }, null,
  ]));
  window.localStorage.setItem('component-studio.prompt-history', '{}');
  render(<App />);
  expect(screen.getByLabelText('AI 제공자')).toHaveValue('google');
  expect(screen.getByLabelText('API Key')).toHaveValue('');
  expect(screen.queryByText('preview')).not.toBeInTheDocument();
});

it('저장소 접근이 차단되어도 입력과 생성은 동작한다', async () => {
  vi.stubGlobal('localStorage', {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('quota'); },
  });
  render(<App />);
  fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'test-key' } });
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '버튼' } });
  fireEvent.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
  expect(await screen.findByText('preview')).toBeInTheDocument();
});

it('Provider 전환 시 저장된 키도 비우고 전체 삭제 결과를 유지한다', async () => {
  const first = render(<App />);
  fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'test-key' } });
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '버튼' } });
  fireEvent.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
  await screen.findByText('preview');
  fireEvent.click(screen.getByRole('button', { name: '전체 삭제' }));
  fireEvent.change(screen.getByLabelText('AI 제공자'), { target: { value: 'anthropic' } });
  first.unmount();
  render(<App />);
  expect(screen.getByLabelText('API Key')).toHaveValue('');
  expect(screen.getByLabelText('AI 제공자')).toHaveValue('anthropic');
  expect(screen.queryByText('preview')).not.toBeInTheDocument();
});
