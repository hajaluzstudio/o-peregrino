import os
import re
import json

SOURCE_MD = r"D:\HAJA LUZ\Antigravity\Dados_IA\scratch\O Peregrino\checklist_producao.md"
TARGET_JSON = r"D:\HAJA LUZ\Antigravity\Dados_IA\scratch\Sistema_ Peregrino\checklist_peregrino.json"

def parse_checklist():
    if not os.path.exists(SOURCE_MD):
        print(f"Arquivo não encontrado: {SOURCE_MD}")
        return None

    with open(SOURCE_MD, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    current_section = "Geral"
    tasks_by_section = {}
    all_tasks = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("## ") or stripped.startswith("### "):
            current_section = re.sub(r"^[#\s\W]+", "", stripped)
            current_section = current_section.replace("?", "").strip()
            if not current_section:
                current_section = "Desenvolvimento"
            if current_section not in tasks_by_section:
                tasks_by_section[current_section] = []
        elif stripped.startswith("- [x]") or stripped.startswith("- [ ]") or stripped.startswith("* [x]") or stripped.startswith("* [ ]"):
            done = "[x]" in stripped
            task_text = re.sub(r"^[-*]\s*\[[ xX]\]\s*", "", stripped)
            # Remove formatação pesada de markdown para ficar limpo no UI
            clean_text = re.sub(r"\*\*([^*]+)\*\*", r"\1", task_text)
            clean_text = re.sub(r"\*([^*]+)\*", r"\1", clean_text)
            clean_text = re.sub(r"`([^`]+)`", r"\1", clean_text)
            clean_text = clean_text.split("*(Concluído")[0].split("*(Conclu")[0].strip()

            task_obj = {
                "title": clean_text[:120],
                "done": done,
                "section": current_section
            }
            tasks_by_section.setdefault(current_section, []).append(task_obj)
            all_tasks.append(task_obj)

    done_count = sum(1 for t in all_tasks if t["done"])
    total_count = len(all_tasks)
    progress_percent = int(round((done_count / total_count) * 100)) if total_count > 0 else 0

    print(f"Total de tarefas lidas do jogo: {total_count}")
    print(f"Concluídas: {done_count} | Pendentes: {total_count - done_count}")
    print(f"Progresso Geral do Jogo: {progress_percent}%")

    return {
        "source": SOURCE_MD,
        "lastSync": "2026-10-10T08:35:00Z",
        "totalTasks": total_count,
        "completedTasks": done_count,
        "overallProgress": progress_percent,
        "sections": tasks_by_section
    }

if __name__ == "__main__":
    result = parse_checklist()
    if result:
        with open(TARGET_JSON, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print("Arquivo JSON de sincronização gerado com sucesso!")
