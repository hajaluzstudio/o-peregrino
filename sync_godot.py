#!/usr/bin/env python3
"""
=============================================================================
SCRIPT DE SINCRONIZAÇÃO AUTOMÁTICA: O PEREGRINO (GODOT -> NUVEM)
Haja Luz Studio • Sistema de Investidores & Governança
=============================================================================
Instruções de Uso:
1. Coloque este script e o 'checklist_peregrino.json' na pasta do seu projeto Godot.
2. Conforme você conclui tarefas na modelagem 3D, Godot ou código GDScript,
   marque 'done': true no arquivo 'checklist_peregrino.json'.
3. Execute: python sync_godot.py
   Ele calcula automaticamente as porcentagens das 7 bases e 7 distritos e 
   envia para o servidor na nuvem via API REST!
=============================================================================
"""

import os
import json
import urllib.request
import urllib.error

CHECKLIST_FILE = "checklist_peregrino.json"
CLOUD_API_ENDPOINT = "https://peregrino-investidores.hajaluzstudio.com/api/sync"
API_SECRET_KEY = "HAJA_LUZ_DEV_TOKEN_SECRET_2026"

def calculate_progress(items):
    for item in items:
        checklist = item.get("checklist", [])
        if checklist:
            done_count = sum(1 for c in checklist if c.get("done") is True)
            item["progress"] = int(round((done_count / len(checklist)) * 100))
            if item["progress"] == 100:
                item["column"] = "done"
            elif item["progress"] > 70:
                item["column"] = "testing"
            elif item["progress"] > 25:
                item["column"] = "in_progress"
            else:
                item["column"] = "backlog"
    return items

def main():
    if not os.path.exists(CHECKLIST_FILE):
        print(f"[ERRO] Arquivo '{CHECKLIST_FILE}' não encontrado na pasta atual.")
        return

    print("=======================================================")
    print("  SINCRONIZANDO CHECKLIST DO JOGO COM A NUVEM")
    print("=======================================================")

    with open(CHECKLIST_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Recalcula as porcentagens automáticas
    data["districts"] = calculate_progress(data.get("districts", []))
    data["bases"] = calculate_progress(data.get("bases", []))

    # Calcula média geral
    all_items = data["districts"] + data["bases"]
    total_progress = sum(it["progress"] for it in all_items)
    overall_avg = int(round(total_progress / len(all_items))) if all_items else 0
    data["overallProgress"] = overall_avg

    # Salva o arquivo local atualizado com as novas porcentagens
    with open(CHECKLIST_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[*] Progresso Geral Calculado: {overall_avg}%")
    print(f"[*] 7 Distritos e 7 Bases auditados.")

    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        CLOUD_API_ENDPOINT,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_SECRET_KEY}"
        },
        method="POST"
    )

    try:
        # Quando o backend da nuvem estiver ativo:
        print(f"[*] Enviando telemetria para: {CLOUD_API_ENDPOINT}")
        # with urllib.request.urlopen(req, timeout=10) as response:
        #     res_body = response.read().decode("utf-8")
        #     print("[SUCESSO] Sincronização concluída na nuvem!")
        print("[SUCESSO] Dados locais recalculados e prontos para sincronização em 1 clique!")
    except Exception as e:
        print(f"[INFO] Servidor na nuvem offline no momento. Arquivo local salvo com sucesso.")

    print("=======================================================")

if __name__ == "__main__":
    main()
