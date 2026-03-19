这份关于 Three.js WebGPU (TSL) 材质节点与光照结合 的技术文档已整理完毕：
------------------------------
Three.js WebGPU (TSL) 材质节点指南
在 Three.js 的 WebGPU 体系中，使用 MeshStandardNodeMaterial 时，各材质节点会自动进入内置的 PBR (基于物理的渲染) 光照模型进行计算。
1. 核心节点功能与光照逻辑

| 节点 (Node) | 对应物理属性 | 光照结合方式 |
|---|---|---|
| colorNode | 基础色 (Albedo) | 决定物体表面反射的光谱。在光照下，它是漫反射（Diffuse）的基础颜色。 |
| roughnessNode | 粗糙度 (Roughness) | 影响高光分布。0 为镜面反射（锐利高光），1 为全漫反射（模糊光斑）。 |
| metalnessNode | 金属度 (Metalness) | 决定反射类型。1 时表现为金属，反射带颜色的光；0 时表现为绝缘体。 |
| emissiveNode | 自发光 (Emissive) | 加法运算。其数值直接叠加在最终像素上，不受场景光源遮挡或阴影影响。 |

------------------------------
2. TSL 代码实现示例
通过 Three.js Shading Language (TSL)，你可以将纹理通道与这些属性绑定：

import { texture, vec3, color } from 'three/tsl';import { MeshStandardNodeMaterial } from 'three';
const material = new MeshStandardNodeMaterial();
// 1. 基础色：从纹理读取 RGB
material.colorNode = texture( diffuseMap ); 
// 2. 粗糙度：通常存储在纹理的绿色 (g) 通道
material.roughnessNode = texture( roughnessMap ).g; 
// 3. 金属度：通常存储在纹理的蓝色 (b) 通道
material.metalnessNode = texture( metalnessMap ).b;
// 4. 自发光：纹理颜色乘以一个强度系数
material.emissiveNode = texture( emissiveMap ).mul( vec3( 0, 1, 0 ) ); // 绿色发光效果

------------------------------
3. 内部渲染流水线 (GPU 逻辑)
在每一帧渲染时，WebGPU 后端会执行以下逻辑：

   1. 数据采样：从指定的 Node（纹理、常数或表达式）中提取当前像素的 r, g, b 数值。
   2. BRDF 计算：获取场景中所有 Light（点光源、平行光、环境光）的向量。
   * 根据 roughness 计算 微平面分布 (D)。
      * 根据 metalness 调整 菲涅尔反射 (F)。
   3. 光照叠加：
   * 最终颜色 = (漫反射 + 镜面高光) * 阴影遮蔽 + 自发光
   4. 输出：将计算后的线性颜色转换为屏幕空间的颜色（如 sRGB）。

------------------------------
4. 关键数值参考

* 数值范围：所有节点输入通常应归一化在 0.0 - 1.0 之间（HDR 环境除外）。
* 云图/蒙版应用：
* 若 texture.r 为 1.0（白色），代表该点为云层，反射率最高。
   * 若 texture.r 为 0.0（黑色），代表该点为背景，不产生云层反射。

------------------------------
下一步建议：您是否需要了解如何通过 TSL 逻辑节点（如 mix, step, add）在这些材质属性之间做动态过渡动画？

