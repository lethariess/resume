import subprocess, tempfile, time, urllib.request, json, base64, os
import tornado.websocket
import tornado.ioloop

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
URL = "file:///C:/Users/login/AppData/Local/agy/bin/interactive-resume/index.html"
OUT_DIR = r"C:\Users\login\AppData\Local\agy\bin\interactive-resume\screenshots"

os.makedirs(OUT_DIR, exist_ok=True)

async def capture_all():
    tmp = tempfile.mkdtemp()
    proc = subprocess.Popen([
        EDGE_PATH,
        '--headless=new',
        f'--user-data-dir={tmp}',
        '--remote-debugging-port=9222',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        '--window-size=1280,1800'
    ])
    time.sleep(2)
    try:
        # Create new target
        req = urllib.request.Request('http://127.0.0.1:9222/json/new?' + URL, method='PUT')
        with urllib.request.urlopen(req) as resp:
            target = json.loads(resp.read().decode())
        
        ws_url = target['webSocketDebuggerUrl']
        print("Connected to target WS:", ws_url)
        
        ws = await tornado.websocket.websocket_connect(ws_url)
        
        msg_id = 0
        async def call(method, params=None):
            nonlocal msg_id
            msg_id += 1
            cur_id = msg_id
            payload = {"id": cur_id, "method": method, "params": params or {}}
            await ws.write_message(json.dumps(payload))
            while True:
                res_str = await ws.read_message()
                res = json.loads(res_str)
                if res.get('id') == cur_id:
                    return res.get('result', {})

        # Enable Page and Runtime
        await call("Page.enable")
        await call("Runtime.enable")
        
        # Wait a bit for fonts & layout
        time.sleep(1)

        # 1. Full page screenshot
        # Set device metrics for full height
        metrics = await call("Page.getLayoutMetrics")
        content_size = metrics['contentSize']
        width = int(content_size['width'])
        height = int(content_size['height'])
        print(f"Content size: {width} x {height}")

        await call("Emulation.setDeviceMetricsOverride", {
            "width": 1280,
            "height": height,
            "deviceScaleFactor": 1.5,
            "mobile": False
        })
        time.sleep(0.5)

        # Full page
        full_res = await call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": True})
        with open(os.path.join(OUT_DIR, "01_full_page.png"), "wb") as f:
            f.write(base64.b64decode(full_res['data']))
        print("Saved 01_full_page.png")

        # Reset device metrics to normal desktop
        await call("Emulation.setDeviceMetricsOverride", {
            "width": 1280,
            "height": 900,
            "deviceScaleFactor": 1.5,
            "mobile": False
        })

        # Helper to screenshot specific section
        async def screenshot_element(selector, filename, pre_eval=None):
            if pre_eval:
                await call("Runtime.evaluate", {"expression": pre_eval})
                time.sleep(0.3)
            
            eval_res = await call("Runtime.evaluate", {
                "expression": f"""
                (() => {{
                    const el = document.querySelector('{selector}');
                    if (!el) return null;
                    el.scrollIntoView({{ behavior: 'instant', block: 'start' }});
                    const rect = el.getBoundingClientRect();
                    return {{ x: rect.left + window.scrollX, y: rect.top + window.scrollY, width: rect.width, height: rect.height }};
                }})()
                """,
                "returnByValue": True
            })
            box = eval_res['result']['value']
            if not box:
                print(f"Selector not found: {selector}")
                return
            
            # Viewport screenshot at that scroll
            clip = {
                "x": box['x'],
                "y": box['y'],
                "width": box['width'],
                "height": box['height'],
                "scale": 1.5
            }
            res = await call("Page.captureScreenshot", {"format": "png", "clip": clip, "captureBeyondViewport": True})
            with open(os.path.join(OUT_DIR, filename), "wb") as f:
                f.write(base64.b64decode(res['data']))
            print(f"Saved {filename}")

        # 2. Hero / Header
        await screenshot_element("#hero", "02_hero_title.png")

        # 3. Skills
        await screenshot_element("#skills", "03_skills.png")

        # 4. Education
        await screenshot_element("#education", "04_education.png", pre_eval="document.getElementById('eduAccordionBtn').click();")

        # 5. Projects
        await screenshot_element("#projects", "05_projects.png")

        # 6. Modal with Architecture diagram
        await call("Runtime.evaluate", {"expression": "document.querySelector('.open-modal-btn[data-modal=\"modal-booking-arch\"]').click();"})
        time.sleep(0.5)
        modal_res = await call("Page.captureScreenshot", {"format": "png"})
        with open(os.path.join(OUT_DIR, "06_project_architecture_modal.png"), "wb") as f:
            f.write(base64.b64decode(modal_res['data']))
        print("Saved 06_project_architecture_modal.png")

        # Close modal
        await call("Runtime.evaluate", {"expression": "document.querySelector('.modal-overlay.open .modal-close').click();"})
        time.sleep(0.3)

        # 7. Live API Playground (Execute call)
        await call("Runtime.evaluate", {"expression": "document.getElementById('sendApiRequestBtn').click();"})
        time.sleep(0.6)
        await screenshot_element("#api-demo", "07_api_demo_interactive.png")

        # 8. Contacts & Feedback
        await screenshot_element("#contacts", "08_contacts.png")

        # 9. Light Theme variant of Hero
        await call("Runtime.evaluate", {"expression": "document.getElementById('themeToggleBtn').click();"})
        time.sleep(0.3)
        await screenshot_element("#hero", "09_light_theme_hero.png")

        print("ALL SCREENSHOTS CAPTURED SUCCESSFULLY!")

    finally:
        proc.terminate()

if __name__ == '__main__':
    tornado.ioloop.IOLoop.current().run_sync(capture_all)
