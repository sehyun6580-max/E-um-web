"use client";

import { useState } from "react";
import type { AgeBand, Gender, Mode, Persona, Relation, Speech, Topic } from "@/lib/types";
import {
  AGES,
  AGE_LABEL,
  GENDERS,
  GENDER_LABEL,
  MAX_CUSTOM_PERSONAS,
  MAX_NAME,
  MAX_TRAITS,
  MODE_SHORT,
  PRESETS,
  RELATIONS,
  RELATION_LABEL,
  SPEECHES,
  SPEECH_LABEL,
  TOPICS,
  TOPIC_INFO,
  TRAITS,
  cleanName,
  personaMeta,
} from "@/lib/personas";
import Sheet from "./Sheet";
import PersonaAvatar from "./PersonaAvatar";

interface Props {
  open: boolean;
  onClose: () => void;
  topic: Topic;
  personaId: string;
  customs: Persona[];
  onTopic: (topic: Topic) => void;
  onPick: (persona: Persona) => void;
  onCreate: (persona: Persona) => void;
  onDelete: (id: string) => void;
}

function customIntro(p: Persona) {
  return [RELATION_LABEL[p.relation], p.traits.join(", "), SPEECH_LABEL[p.speech]]
    .filter(Boolean)
    .join(" · ");
}

export default function PersonaSheet({
  open,
  onClose,
  topic,
  personaId,
  customs,
  onTopic,
  onPick,
  onCreate,
  onDelete,
}: Props) {
  const [building, setBuilding] = useState(false);
  const full = customs.length >= MAX_CUSTOM_PERSONAS;

  return (
    <Sheet
      open={open}
      onClose={() => {
        setBuilding(false);
        onClose();
      }}
      title="누구와 이야기할까요?"
      sub="캐릭터는 말투와 분위기만 바꿔요. 이음의 상담 원칙과 안전 안내는 그대로예요."
      wide
    >
      <fieldset className="ps-block">
        <legend className="ps-label">고민 종류</legend>
        <div className="seg">
          {TOPICS.map((t) => (
            <label key={t} className="seg-opt">
              <input
                type="radio"
                name="eum-topic"
                checked={topic === t}
                onChange={() => onTopic(t)}
              />
              <span>{TOPIC_INFO[t].label}</span>
            </label>
          ))}
        </div>
        <p className="ps-hint">{TOPIC_INFO[topic].hint}을 함께 봐요.</p>
      </fieldset>

      <div className="ps-block">
        <h3 className="ps-label">캐릭터</h3>
        <ul className="ps-grid">
          {[...PRESETS, ...customs].map((p) => {
            const custom = p.id.startsWith("custom:");
            return (
              <li key={p.id} className="ps-item">
                <button
                  type="button"
                  className="ps-card"
                  aria-pressed={p.id === personaId}
                  onClick={() => {
                    onPick(p);
                    setBuilding(false);
                    onClose();
                  }}
                >
                  <PersonaAvatar persona={p} size={40} />
                  <span className="ps-text">
                    <span className="ps-name">
                      {p.name}
                      <span className="ps-meta">{personaMeta(p)}</span>
                    </span>
                    <span className="ps-intro">{p.intro ?? customIntro(p)}</span>
                  </span>
                </button>
                {custom && (
                  <button
                    type="button"
                    className="ps-del"
                    aria-label={`${p.name} 캐릭터 지우기`}
                    title="이 캐릭터 지우기"
                    onClick={() => onDelete(p.id)}
                  >
                    <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden>
                      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </li>
            );
          })}
          {!building && (
            <li className="ps-item">
              <button
                type="button"
                className="ps-card ps-card--new"
                onClick={() => setBuilding(true)}
                disabled={full}
              >
                <span className="ps-plus" aria-hidden>
                  +
                </span>
                <span className="ps-text">
                  <span className="ps-name">직접 만들기</span>
                  <span className="ps-intro">
                    {full
                      ? `직접 만든 캐릭터는 ${MAX_CUSTOM_PERSONAS}명까지예요. 하나를 지운 뒤 만들어 주세요.`
                      : "성별, 나이대, 성격, 말투를 골라 나만의 캐릭터를 만들어요."}
                  </span>
                </span>
              </button>
            </li>
          )}
        </ul>
      </div>

      {building && (
        <Builder
          onCancel={() => setBuilding(false)}
          onSave={(p) => {
            onCreate(p);
            setBuilding(false);
            onClose();
          }}
        />
      )}
    </Sheet>
  );
}

function Builder({ onCancel, onSave }: { onCancel: () => void; onSave: (p: Persona) => void }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [age, setAge] = useState<AgeBand>("20s");
  const [traits, setTraits] = useState<string[]>(["다정한"]);
  const [speech, setSpeech] = useState<Speech>("casual");
  const [relation, setRelation] = useState<Relation>("friend");
  const [mode, setMode] = useState<Mode>("F");
  const [error, setError] = useState("");

  function toggleTrait(t: string) {
    setTraits((cur) =>
      cur.includes(t) ? cur.filter((x) => x !== t) : cur.length < MAX_TRAITS ? [...cur, t] : cur,
    );
  }

  return (
    <form
      className="ps-builder"
      onSubmit={(e) => {
        e.preventDefault();
        const clean = cleanName(name);
        if (!clean) {
          setError("캐릭터 이름을 적어 주세요.");
          return;
        }
        onSave({
          id: `custom:${crypto.randomUUID().slice(0, 8)}`,
          name: clean,
          gender,
          age,
          traits,
          speech,
          relation,
          mode,
        });
      }}
    >
      <h3 className="ps-builder-title">나만의 캐릭터 만들기</h3>

      <label className="field">
        <span className="field-label">이름</span>
        <input
          className="input"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          maxLength={MAX_NAME}
          placeholder="예: 민준, 지수 선배"
          autoComplete="off"
        />
      </label>

      <Choice label="성별" name="b-gender" options={GENDERS} labels={GENDER_LABEL} value={gender} onChange={setGender} />
      <Choice label="나이대" name="b-age" options={AGES} labels={AGE_LABEL} value={age} onChange={setAge} />

      <fieldset className="seg-field">
        <legend className="field-label">
          성격 <span className="seg-note">{MAX_TRAITS}개까지</span>
        </legend>
        <div className="seg seg--wrap">
          {TRAITS.map((t) => (
            <label key={t} className="seg-opt">
              <input
                type="checkbox"
                checked={traits.includes(t)}
                disabled={!traits.includes(t) && traits.length >= MAX_TRAITS}
                onChange={() => toggleTrait(t)}
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Choice label="말투" name="b-speech" options={SPEECHES} labels={SPEECH_LABEL} value={speech} onChange={setSpeech} />
      <Choice label="나와의 관계" name="b-relation" options={RELATIONS} labels={RELATION_LABEL} value={relation} onChange={setRelation} />
      <Choice
        label="기본 상담 스타일"
        name="b-mode"
        options={["F", "T"] as Mode[]}
        labels={{ F: `${MODE_SHORT.F} (감정을 먼저 받아줘요)`, T: `${MODE_SHORT.T} (놓친 사실을 짚어줘요)` }}
        value={mode}
        onChange={setMode}
      />

      {error && (
        <p className="ps-error" role="alert">
          {error}
        </p>
      )}
      <div className="ps-builder-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          그만두기
        </button>
        <button type="submit" className="btn btn-dark">
          만들고 이야기하기
        </button>
      </div>
    </form>
  );
}

function Choice<T extends string>({
  label,
  name,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="seg-field">
      <legend className="field-label">{label}</legend>
      <div className="seg seg--wrap">
        {options.map((o) => (
          <label key={o} className="seg-opt">
            <input type="radio" name={name} checked={value === o} onChange={() => onChange(o)} />
            <span>{labels[o]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
