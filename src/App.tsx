import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import { useStoredState } from './hooks/useStoredState';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = useStoredState('component-studio.api-key', '',
    (value) => typeof value === 'string' ? value : '');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useStoredState<Provider>('component-studio.provider', 'google',
    (value) => value === 'anthropic' ? 'anthropic' : 'google');
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, promptHistory, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    generate(prompt, apiKey || undefined, provider);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setApiKey('');
  };

  const activeProvider = PROVIDER_CONFIG[provider].label;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-mark">RC</div>
        <div className="header-copy">
          <h1>Component Studio</h1>
          <p>작은 아이디어가 쓸 만한 UI가 되는 곳</p>
        </div>
        <div className="header-meta" aria-label="현재 작업 상태">
          <div>
            <span>생성 모델</span>
            <strong>{activeProvider}</strong>
          </div>
          <div>
            <span>작업 보관함</span>
            <strong>{components.length}개</strong>
          </div>
        </div>
      </header>

      <div className="studio-intro">
        <h2>상상은 자유롭게.<br />만드는 건 가볍게.</h2>
        <p>만들고 싶은 UI를 글로 적어보세요.<br />React 컴포넌트를 만들고, 미리 보고, 코드로 가져가세요.</p>
      </div>

      <main className="workspace">
        <section className="composer-panel" aria-label="컴포넌트 생성">
          <div className="window-bar"><span className="window-symbol" aria-hidden="true" />새 컴포넌트</div>
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} history={promptHistory} />
        </section>

        <aside className="settings-panel" aria-label="실행 설정">
          <div className="window-bar"><span className="window-symbol" aria-hidden="true" />연결 설정</div>
          <div className="settings-header">
            <h2>함께 만들 모델</h2>
            <p>사용할 AI와 API 키를 설정하세요.</p>
          </div>
          <div className="provider-select">
            <label htmlFor="provider">AI 제공자</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as Provider)}
            >
              {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="api-key-input">
            <label htmlFor="api-key">
              API Key
            </label>
            <div className="api-key-field">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  hasEnvKey
                    ? '서버 키 사용 중 (직접 입력으로 덮어쓰기 가능)'
                    : PROVIDER_CONFIG[provider].placeholder
                }
              />
              <button
                className="btn-toggle-key"
                onClick={() => setShowKey(!showKey)}
                type="button"
                aria-pressed={showKey}
                aria-label={showKey ? 'API 키 숨기기' : 'API 키 보기'}
              >
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>
            <p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>
              {hasEnvKey ? '.env 키가 연결되어 있습니다.' : '직접 입력하거나 서버 환경변수를 설정하세요.'}
            </p>
          </div>
          <p className="settings-note">서버에 등록된 키가 있으면 바로 시작할 수 있어요. 다른 키를 사용하려면 위에 입력하세요.</p>
        </aside>
      </main>

      {error && (
        <div className="error-banner" role="alert">
          <p>{error}</p>
        </div>
      )}

      <section className="results-section">
          <div className="results-header">
            <div>
              <h2>작업 보관함 <span className="results-count">{components.length}</span></h2>
            </div>
            {components.length > 0 && (
            <button className="btn-clear" onClick={clearAll}>
              전체 삭제
            </button>
            )}
          </div>

        {components.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-preview" aria-hidden="true">
              <div className="empty-window">
                <span />
                <span />
                <span />
              </div>
              <div className="empty-canvas">
                <div className="empty-card empty-card--primary" />
                <div className="empty-card" />
                <div className="empty-card empty-card--wide" />
              </div>
            </div>
            <div className="empty-copy">
              <h2>첫 작품을 기다리는 중이에요.</h2>
              <p>위에서 아이디어를 입력하거나 예시를 골라보세요.<br />완성된 컴포넌트와 코드가 이곳에 모입니다.</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-card" role="status">
            <div className="loading-pulse" />
            <p>컴포넌트를 생성하고 있습니다...</p>
          </div>
        )}

        <div className="results-grid">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onRemove={removeComponent}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>
      <footer className="app-footer"><span>Component Studio · React로 만드는 나만의 작업실</span><span>아이디어 입력 → 생성 → 미리보기 & 코드 복사</span></footer>
    </div>
  );
}

export default App;
