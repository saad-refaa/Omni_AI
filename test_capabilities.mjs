import { mouse, keyboard, Point, Key, clipboard } from '@nut-tree/nut-js';
import screenshot from 'screenshot-desktop';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

async function runTests() {
  console.log("=== OMNICORE CAPABILITIES TEST ===");
  
  try {
    console.log("[1/5] Testing System Terminal (exec)...");
    const { stdout } = await execAsync('echo "Terminal works!"');
    console.log("Terminal output: " + stdout.trim());

    console.log("\n[2/5] Testing Clipboard...");
    const originalText = await clipboard.paste();
    await clipboard.copy("OmniCore Test successful");
    const newText = await clipboard.paste();
    console.log("Clipboard check: " + newText);
    await clipboard.copy(originalText); // Restore

    console.log("\n[3/5] Testing Mouse Movement...");
    const currentPos = await mouse.getPosition();
    console.log(`Current mouse pos: ${currentPos.x}, ${currentPos.y}`);
    await mouse.setPosition(new Point(currentPos.x + 50, currentPos.y + 50));
    console.log("Mouse moved successfully!");
    await mouse.setPosition(currentPos); // Restore

    console.log("\n[4/5] Testing Keyboard...");
    console.log("(Typing 'test' and deleting it...)");
    await keyboard.type("test");
    for(let i=0; i<4; i++) {
        await keyboard.pressKey(Key.Backspace);
        await keyboard.releaseKey(Key.Backspace);
    }
    console.log("Keyboard works!");

    console.log("\n[5/5] Testing Screen Capture...");
    const imgBuffer = await screenshot();
    console.log(`Screenshot taken! Size: ${imgBuffer.length} bytes`);

    console.log("\n✅ ALL TESTS PASSED SUCCESSFULLY! The OmniCore OS is fully capable on this machine.");
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err);
  }
}

runTests();
