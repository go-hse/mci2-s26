
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
export function loadSplat(scene, renderer, splatURL) {
    const spark = new SparkRenderer({ renderer });
    scene.add(spark);
    const splat = new SplatMesh({ url: splatURL });
    splat.quaternion.set(1, 0, 0, 0);
    splat.position.set(0, 0, -3);
    scene.add(splat);
}
